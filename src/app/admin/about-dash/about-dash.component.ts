import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Database } from '@angular/fire/database';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-about-dash',
  templateUrl: './about-dash.component.html',
  styleUrls: ['./about-dash.component.scss']
})
export class AboutDashComponent implements OnInit {
 
  datalist: any[] = [];
  CarasoulAboutURL: string = "";
  // for controlling view and adata
  carsouelFormControl: string = "";
  partViewController: string = "";
  sectionViewController: string = "";
  edit_control: string = "";
  uploading: string = "";
  // for update
  updateObject: any;
  // for check delete
  deletedObject: any;
  // for popup deleted item show
  showDeleteDiv:boolean=false;
  // for adding data
  homeImg=this.fb.group({
    img:[""],
    id:[new Date().getTime()]
  })
  About=this.fb.group({
    paragraph:["",Validators.required],
    id:[new Date().getTime()]
  })


  constructor(private route:Router,private fb:FormBuilder , private database:Database, private dataServ:DataService , private http:HttpClient, private firestorage:AngularFireStorage) { 
  }

  ngOnInit(): void {
    this.openPart('table data','carsouel','');
  }
 // open the view for data special control 
 openPart(part:string,type:string,action:string){
    this.partViewController=part;
    this.sectionViewController=action;
    this.carsouelFormControl=action;
    this.edit_control=type;
    // delete texts and old data
    this.uploading=""
    this.showDeleteDiv=false
    if(part=="table data"){
      this.showdata(type);
    }
  }
  EmptyFormInputs(){
    this.About.patchValue({
      paragraph:""
    })
  }

  // ----------------------------- Carasoul function for About -----------------------------
  sendCarasoulAbout(){
    this.homeImg.patchValue({
      img:this.CarasoulAboutURL
    })
    if( this.sectionViewController =="add"){
        this.dataServ.create(this.homeImg.value,"AboutCarasoul","add");
      }
      else if(this.edit_control=="carsouel" && this.sectionViewController =="edit"){
            this.dataServ.getAboutCarsoul().subscribe(data=>{
              for (const key in data) {
                if(this.updateObject.id==data[key].id){
                  this.homeImg.patchValue({
                    id:Number(this.updateObject.id)
              })
              this.dataServ.create(this.homeImg.value,"AboutCarasoul",key);
              break;
            }
          }
        })
      }
    this.uploading="null";
    setTimeout(() => { location.reload() }, 500);
  }

  // ----------------------------- Data function for About -----------------------------
  sendAboutData(){
    if(this.About.valid){
      if(this.sectionViewController =="add")
      {
        this.dataServ.create(this.About.value,"AboutContent","add")
      }
      else if(this.edit_control=="content" && this.sectionViewController =="edit"){
            this.dataServ.getAboutContent().subscribe(data=>{
              for (const key in data) {
                if(this.updateObject.id==data[key].id){
                  this.About.patchValue({
                    id:Number(this.updateObject.id)
              })
              this.dataServ.create(this.About.value,"AboutContent",key);
              break;
            }
          }
        })
      }
      setTimeout(() => { location.reload() }, 500);
    }
  }

  //----------------------------- for view the data in table -----------------------------
  showdata(type:string){
    this.datalist=[]
    if(type=="carsouel"){
      this.dataServ.getAboutCarsoul().subscribe(data=>{
        for (const key in data) {
          this.datalist.push(data[key])
        }
      })
    }else  if(type=="content"){
      this.dataServ.getAboutContent().subscribe(data=>{
        for (const key in data) {
          this.datalist.push(data[key])
        }
      })
    }
  }

  // ----------------------------- update part -----------------------------
  update(item:any,sectionViewController:string){
    this.updateObject=item;
    if(this.edit_control=='carsouel' && sectionViewController=='edit')
      {
        this.sectionViewController=sectionViewController
      } else if(this.edit_control=='content' && sectionViewController=='edit')
      {
        this.About.patchValue({
          paragraph:item.paragraph
        })
        this.sectionViewController=sectionViewController
      }
  }

  // ----------------------------- delete part -----------------------------
  DeleteSure(item:any){
    this.deletedObject=item;
    this.showDeleteDiv=true;
  }
  deleteDone(){
    this.deleteItem(this.deletedObject,"delete");
    this.showDeleteDiv=false;
  }
  cancel_delete(){
    this.showDeleteDiv=false;
  }
  deleteItem(item:any,sectionViewController:string){
    this.deletedObject=item;
    // ----------- delete carasoul -----------
    if(this.edit_control=='carsouel' && sectionViewController=='delete') {
      this.sectionViewController=sectionViewController;
      this.dataServ.getAboutCarsoul().subscribe(data=>{
        for (const key in data) {
          if(item.id==data[key].id){
            this.dataServ.delete("AboutCarasoul",key);
            break;
          }
        }
      })
    // ----------- delete content -----------
    } else if(this.edit_control=='content' && sectionViewController=='delete'){
      this.sectionViewController=sectionViewController;
      this.dataServ.getAboutContent().subscribe(data=>{
        for (const key in data) {
          if(item.id==data[key].id){
            console.log(item.id)
            this.dataServ.delete("AboutContent",key);
            break;
          }
        }
      })
    }
    setTimeout(() => { this.showdata(this.edit_control) }, 500);
  }

  // -------------- funcion to upload img file and get image url ---- for About Product --------------
  async uploadAboutCarasoul(event:any){
    this.uploading="uploadingAboutCarasoul";
    let date=new Date()
    const file=event.target.files[0];
    if(file){
      const path=`alBairaq/${file.name}${new Date().getTime()}`; // we make name of file in firebase storage 
      const uploadTask = await this.firestorage.upload(path,file)
      const url =await uploadTask.ref.getDownloadURL()
      this.CarasoulAboutURL=url;
    }
    this.uploading="uploadedAboutCarasoul";
  }
  
}
