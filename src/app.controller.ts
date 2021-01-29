import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import DiscordOauth2 from 'discord-oauth2';

@Controller()
export class AppController {
  private readonly oauth: DiscordOauth2;
  constructor(private readonly configService: ConfigService) {
    this.oauth = new DiscordOauth2({
      clientId: configService.get('DISCORD_CLIENT_ID'),
      clientSecret: configService.get('DISCORD_CLIENT_SECRET'),
      redirectUri: 'http://localhost:3000/discord/callback',
    });
  }

  @Get('discord')
  @Redirect()
  async discord() {
    const url = this.oauth.generateAuthUrl({
      scope: ['identify'],
      state: randomBytes(16).toString('hex'),
    });
    return { url };
  }

  @Get('discord/callback')
  async discordCallback(@Query('code') code: string) {
    const response = await this.oauth.tokenRequest({
      code,
      scope: 'identify',
      grantType: 'authorization_code',
    });
    return { ...response };
  }
}
