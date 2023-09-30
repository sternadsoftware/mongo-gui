import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';

import { ReactiveFormsModule } from '@angular/forms';
import {NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule} from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LogoutComponent } from './logout.component';
import { NzAlertModule } from 'ng-zorro-antd/alert';
@NgModule({
  declarations: [LoginComponent, LogoutComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzCardModule,
    NzIconModule,
    NzAlertModule
  ],
  exports: [LoginComponent, LogoutComponent]
})
export class AuthModule { }
