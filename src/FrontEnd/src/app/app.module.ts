import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from './register/register.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { PlaygroundComponent } from './playground/playground.component';
import { ToastrModule } from 'ngx-toastr';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ForumComponent } from './forum/forum.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { NgChartsModule } from 'ng2-charts';
import { SpinnerComponent } from './spinner/spinner.component';
import { DragScrollModule } from 'ngx-drag-scroll';
import { FilesComponent } from './playground/files/files.component';
import { ModelComponent } from './playground/model/model.component';
import { GraphicComponent } from './playground/graphic/graphic.component';
import { ParametersComponent } from './playground/parameters/parameters.component';
import { TopicComponent } from './forum/topic/topic.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { DataSearchPipe } from './_pipes/data-search.pipe';
import { RepliesComponent } from './forum/topic/replies/replies.component';
import { FileProjectsComponent } from './playground/file-projects/file-projects.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { CorrMatrixComponent } from './playground/corr-matrix/corr-matrix.component';
import { FeatureSelectionComponent } from './playground/feature-selection/feature-selection.component';
import { ContactComponent } from './contact/contact.component';
import { CoolSocialLoginButtonsModule } from '@angular-cool/social-login-buttons';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { InterceptorService } from './_services/interceptor.service';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatDividerModule } from '@angular/material/divider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NewExperimentComponent } from './playground/new-experiment/new-experiment.component';
import { FillValuesComponent } from './playground/fill-values/fill-values.component';
import { JwtInterceptorService } from './interceptors/jwt-interceptor.service';
import { BoxplotComponent } from './playground/files/boxplot/boxplot.component';
import { PredictionsComponent } from './predictions/predictions.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    PlaygroundComponent,
    ForumComponent,
    ProfilePageComponent,
    AdminPanelComponent,
    SpinnerComponent,
    FilesComponent,
    ModelComponent,
    GraphicComponent,
    ParametersComponent,
    TopicComponent,
    DataSearchPipe,
    RepliesComponent,
    FileProjectsComponent,
    PagenotfoundComponent,
    CorrMatrixComponent,
    FeatureSelectionComponent,
    ContactComponent,
    ChatbotComponent,
    NewExperimentComponent,
    FillValuesComponent,
    BoxplotComponent,
    PredictionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    NgChartsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-top-left',
      preventDuplicates: true
    }),
    CarouselModule.forRoot(),
    DragScrollModule,
    PaginationModule,
    CoolSocialLoginButtonsModule,
    MatProgressBarModule,
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
    }),
    MatDividerModule,
    DragDropModule,
  ],
  providers: [
    { provide:HTTP_INTERCEPTORS,useClass:InterceptorService,multi:true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient){
  return new TranslateHttpLoader(http);
}
