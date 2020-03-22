import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.css']
})
export class CreateSessionComponent {

  constructor() {
   this.createForm();
  }

  createForm() {
  }

  submitForm(frmElement) {
    console.log(frmElement.form.value)
  }
}