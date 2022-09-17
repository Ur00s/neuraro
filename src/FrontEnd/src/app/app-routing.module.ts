import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { ContactComponent } from './contact/contact.component';
import { ForumComponent } from './forum/forum.component';
import { TopicComponent } from './forum/topic/topic.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { FileProjectsComponent } from './playground/file-projects/file-projects.component';
import { NewExperimentComponent } from './playground/new-experiment/new-experiment.component';
import { PlaygroundComponent } from './playground/playground.component';
import { PredictionsComponent } from './predictions/predictions.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {path:'', component:HomeComponent},
  {path:"playground",component:PlaygroundComponent},
  {path:"register",component:RegisterComponent},
  {path:"login",component:LoginComponent},
  {path:"forum",component:ForumComponent},
  {path:"profile",component:ProfilePageComponent},
  {path:"forum/topic/:topicid",component:TopicComponent},
  {path:"adminpanel",component:AdminPanelComponent},
  {path:"contact",component:ContactComponent},
  {path:"chatbot",component:ChatbotComponent},
  {path:"FileAndProjects",component:FileProjectsComponent},
  {path:"predictions/:id",component:PredictionsComponent},
  { path: '**', pathMatch: 'full',
        component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
