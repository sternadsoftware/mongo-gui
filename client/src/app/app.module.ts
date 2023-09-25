import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './api.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DocumentComponent } from './document/document.component';
import { CollectionComponent } from './collection/collection.component';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { Type, HasMoreText, IsExpandable, FormatValue } from './common/pipes/pipes';
import { FileSizePipe } from './common/pipes/file-size.pipe';
import { HttpErrorInterceptor } from './common/interceptors/http-error.interceptor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTableModule } from 'ng-zorro-antd/table';

@NgModule({
  declarations: [
    AppComponent,
    DocumentComponent,
    Type,
    IsExpandable,
    HasMoreText,
    FormatValue,
    FileSizePipe,
    CollectionComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MonacoEditorModule.forRoot(),
    NzSelectModule,
    NzDropDownModule,
    NzTagModule,
    NzModalModule,
    NzDrawerModule,
    NzEmptyModule,
    NzSpinModule,
    NzPopconfirmModule,
    NzPaginationModule,
    NzRadioModule,
    NzUploadModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzToolTipModule,
    NzLayoutModule,
    NzFormModule,
    NzTabsModule,
    NzDescriptionsModule,
    NzTableModule
  ],
  providers: [ApiService, { provide: NZ_I18N, useValue: en_US }, {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpErrorInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent],
})
export class AppModule { }
