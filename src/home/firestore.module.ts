// firestore.module.ts
import { Module } from '@nestjs/common';
import { FirestoreService } from './firestore.service';

@Module({
  providers: [FirestoreService],
  exports: [FirestoreService], // để module khác dùng được
})
export class FirestoreModule {}
