import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ParticlesConfig } from './particles-config';
declare let particlesJS: any
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  particlesJS: any;
  constructor(private accountService : AccountService,private router: Router) {
    
   }

   public ngOnInit(): void {
    this.invokeParticles();
    if(sessionStorage.getItem('user'))
    {
      this.router.navigate(["/playground"]);
    }
  }
  public invokeParticles(): void {
    particlesJS('particles-js', ParticlesConfig, function() {});
  }
}


