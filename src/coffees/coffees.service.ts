import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/commom/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';

@Injectable()
export class CoffeesService {

    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRespository: Repository<Coffee>,
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,
        private readonly dataSource: DataSource,
    ) {}

    async findAll(paginationQuery: PaginationQueryDto) {
        const { limit, offset } = paginationQuery
        return await this.coffeeRespository.find({
            relations: {
                flavors: true
            },
            skip: offset,
            take: limit
        });
    }

    async findOne(id: string) {
        const coffee = await this.coffeeRespository.findOne({
            where: {
                id: +id
            },
            relations: {
                flavors: true
            }
        })

        if (! coffee) {
            // throw new HttpException(`Coffee #${id} not found`, HttpStatus.NOT_FOUND)
            throw new NotFoundException(`Coffee #${id} not found`)
        }

        return coffee
    }

    async create(coffeeDto: CreateCoffeeDto) {
        const flavors = await Promise.all(
            coffeeDto.flavors.map( name => this.preloadFlavorByName(name) )
        )

        const coffee = await this.coffeeRespository.create({
            ...coffeeDto,
            flavors
        })
        return this.coffeeRespository.save(coffee)
    }

    async update(id: string, coffeeDto: UpdateCoffeeDto) {
        const flavors = coffeeDto.flavors && (await Promise.all(
            coffeeDto.flavors.map( name => this.preloadFlavorByName(name) )
        ))

        const coffee = await this.coffeeRespository.preload({
            id: +id,
            ... coffeeDto,
            flavors
        })

        if (! coffee) {
            throw new NotFoundException(`Coffee #${id} not found`)
        }

        return this.coffeeRespository.save(coffee)
    }

    async remove(id: string) {
        const coffee = await this.findOne(id)
        return this.coffeeRespository.remove(coffee)
    }

    async recommendCoffee(coffee: Coffee) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            coffee.recomendations++;

            const recommendedEvent = new Event();
            recommendedEvent.name = "recommended_coffee"
            recommendedEvent.type = "coffee"
            recommendedEvent.payload = {coffeeId: coffee.id}

            await queryRunner.manager.save(coffee)
            await queryRunner.manager.save(recommendedEvent)
        
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
        } finally {
            await queryRunner.release()
        }
    }

    private async preloadFlavorByName(name: string): Promise<Flavor> {
        const existingFlavor = await this.flavorRepository.findOne({
            where: { name: name }
        });

        if (existingFlavor) {
            return existingFlavor
        }

        return this.flavorRepository.create({name})
    }
}
