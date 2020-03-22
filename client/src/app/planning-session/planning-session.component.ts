import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-planning-session',
  templateUrl: './planning-session.component.html',
  styleUrls: ['./planning-session.component.css']
})
export class PlanningSessionComponent implements OnInit {
  id;

  constructor(private _Activatedroute:ActivatedRoute) { 
    this._Activatedroute.paramMap.subscribe(params => { 
    this.id = params.get('id'); 
    alert(this.id);
  });
  }

  ngOnInit(): void {
  }

}
