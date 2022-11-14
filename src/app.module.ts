import { AuthModule } from '@auth/auth.module';
import { BookmarkModule } from '@bookmark/bookmark.module';
import { DatabaseModule } from '@database/database.module';
import { Module } from '@nestjs/common';
import { UserModule } from '@user/user.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, BookmarkModule],
})
export class AppModule {}
