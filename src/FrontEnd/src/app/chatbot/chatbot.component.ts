import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService } from '../_services/chatbot.service';
import { ChatbothubService } from '../_services/chatbothub.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  public waiting:boolean=false;
  public Conversation:string[] =[];
  public OnlineOrOffline!:boolean;
  public ValueCheck:boolean=true;
  constructor(private fb: FormBuilder,private chatbotService: ChatbotService,private router: Router) { }

  msgForm=this.fb.group({
    message:['']
  });
  ngOnInit(): void {
    this.chatbotService.test().subscribe(x=>{
      //console.log(x);
      this.OnlineOrOffline=x;
    })
  }
  checkVal()
  {
    let input = (document.getElementById("Question") as HTMLInputElement).value
    if(input.trim().length==0){
      this.ValueCheck=false;
    }else
    {
      this.ValueCheck=true;
    }
  }
  send()
  {
    if(this.msgForm.value.message.toLowerCase()=="clear")
    {
      this.Conversation=[];
    }else if(this.msgForm.value.message.toLowerCase()=="exit")
    {
      this.router.navigate(["/"]);
    }
    else
    {
      this.waiting=true;
      this.Conversation.push(this.msgForm.value.message.trim());
      this.chatbotService.send(this.msgForm.value.message.trim()).subscribe(x=>{
        this.Conversation.push(x.Odgovor);
        //console.log(x.Odgovor);
        this.waiting=false;
      },error=>{
        this.chatbotService.test().subscribe(u=>{
          //console.log(x);
          this.OnlineOrOffline=u;
          this.Conversation=[];
        })
      })
      //console.log(this.Conversation);
    }
    this.msgForm.get('message')?.setValue("");
  }
}
