import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    RouterModule.forRoot([]) // Empty routes for server-side rendering
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' }
  ]
})
export class AppServerModule { }
