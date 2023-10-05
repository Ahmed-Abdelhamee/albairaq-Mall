import { Component, OnInit } from '@angular/core';
import { homePhoto } from '../../interfaces/home.interface';
import * as $ from 'jquery';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private dataServ:DataService) {
    if(sessionStorage.getItem("runCarsouel")!="homeReloaded"){
      sessionStorage.setItem("runCarsouel","homeReloaded")
      location.reload();
    }
   }

  imgSource:any;
  carasoulImages:homePhoto[]=[]
  images:homePhoto[]=[];
  seeMoreImgs:boolean=false;
  imageShow:homePhoto[]=[];

  ngOnInit(): void {
    this.dataServ.getCarsoul().subscribe(data =>{
      for (const key in data) {
        this.carasoulImages.push(data[key])
      }
    })
    this.dataServ.gethomeImages().subscribe(data =>{
      for (const key in data) {
        this.images.push(data[key])
      }
      this.images.reverse()
    })
    
    $(function () {
      hide() 
      function hide() {
        $(".showImg").hide();
      }
      $("#close").on("click", hide);
    });
  }

  showProduct(src:homePhoto){
    this.imageShow=[]
    $(function () {
      $(".showImg").show();
    })
    setTimeout(()=> this.imageShow=this.images,50)
    this.imgSource=this.images.indexOf(src);
  }
    
}
