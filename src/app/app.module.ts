import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorService } from './_services/error.service';
import { ErrorHandler } from '@angular/core';
import { JwtInterceptor } from './_guards/jwt.interceptor';
import { EventService } from './_services/event.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
	declarations: [AppComponent],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TooltipModule.forRoot(),
		FormsModule,
		HttpClientModule,
		BrowserModule,
		NgMultiSelectDropDownModule.forRoot(),
		ToastrModule.forRoot(), // ToastrModule added
		EditorModule,
		PdfViewerModule,
		AppRoutingModule,
	],
	providers: [
		HttpClientModule,
		EventService,
		{
			provide: ErrorHandler,
			useClass: ErrorService,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: JwtInterceptor,
			multi: true,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule { }
