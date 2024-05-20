import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Event])],
    controllers: [], 
    providers: []
})
export class EventModule {}
