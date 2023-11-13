import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Database } from '@angular/fire/database';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dining-dash',
  templateUrl: './dining-dash.component.html',
  styleUrls: ['./dining-dash.component.scss']
})
export class DiningDashComponent implements OnInit  {
  
  // data variables
  parttext:string="";
  productURL:string="";
  CarasoulURL:string="";
  datalist:any[]=[];
  databaseURL:any="";
  // variables for controll the view
  carsouelFormControl:string="";
  partViewController:string="";
  sectionViewController:string="";
  edit_control:string="";
  viewController:string="dining";
  uploadingImg:string="null";
  uploadingCarasoul:string="null";
  // for check update
  updateObject:any;
  // for check delete
  deletedObject: any;
  // for popup deleted item show
  showDeleteDiv:boolean=false;
  // for adding 
  diningImg=this.fb.group({
    img:[""],
    url:[""],
    id:[new Date().getTime()]
  })

  constructor(private route:Router,private fb:FormBuilder , private database:Database, private dataServ:DataService , private http:HttpClient, private firestorage:AngularFireStorage) { 
    if(sessionStorage.getItem("Admin")!="AdminisTrue"){
      route.navigate(["/admin/dash-login"])
    }
    this.databaseURL=this.database.app.options.databaseURL;
  }

  ngOnInit(): void {
    this.openPart('table data','dining-carsouel','')
  }

    // ------------------------------------- open part ------------------------------------------
    openPart(part:string,type:string,action:string){
      this.parttext=`the show of ${type}`
      this.partViewController=part;
      this.sectionViewController=action;
      this.carsouelFormControl=action;
      this.edit_control=type;
      // delete texts and old data
      this.uploadingCarasoul=""
      this.uploadingImg=""
      this.showDeleteDiv=false
      if(part=="table data"){
        this.showdata(type);
      }
      this.diningImg.patchValue({
        url:""
      })
    }
  
    // ------------------------------------ show data table -------------------------------------
    showdata(type:string){
      this.datalist=[]
      this.edit_control=type;
      if(type=="dining-carsouel"){
        this.dataServ.getDiningCarsoul().subscribe(data=>{
          for (const key in data) {
            this.datalist.push(data[key])
          }
        })
      }else  if(type=="dining-products"){
        this.dataServ.getDiningImages().subscribe(data=>{
          for (const key in data) {
            this.datalist.push(data[key])
          }
        })
      }
    }
  

// ------------------------------------- send data to add to database -----------------------------------
  
  // ------------- Carasoul function for dining -----------------
  sendCarasoul(edit_control:string,sectionViewController:string){
    this.diningImg.patchValue({
      img:this.CarasoulURL,
    })
    // add carasoul
    if(edit_control=="dining-carsouel" && sectionViewController =="add")
    {
      this.dataServ.create(this.diningImg.value,"diningCarasoul","add");
    }
    // edit carasoul
    else if(edit_control=="dining-carsouel" && sectionViewController =="edit"){
      this.dataServ.getDiningCarsoul().subscribe(data=>{
        for (const key in data) {
          if(this.updateObject.id==data[key].id){
            this.diningImg.patchValue({
              id:Number(this.updateObject.id)
            })
            this.dataServ.create(this.diningImg.value,"diningCarasoul",key);
            break;
          }
        }
      })
    }
    this.uploadingCarasoul="null";
  }
  // ------------- product function for dining -----------------
  sendProducts(edit_control:string,sectionViewController:string){
    this.diningImg.patchValue({
      img:this.productURL
    })
    if(edit_control=="dining-products" && sectionViewController =="add"){
      this.dataServ.create(this.diningImg.value,"diningImages","add");
    }
    else if(edit_control=="dining-products" && sectionViewController =="edit"){
      this.dataServ.getDiningImages().subscribe(data=>{
        this.diningImg.patchValue({
          id:Number(this.updateObject.id)
        })
        // code for if there is no change for one of product elements
        if(this.diningImg.get("img")?.value==""){
          this.diningImg.patchValue({
            img:this.updateObject.img
          })
        }else if(this.diningImg.get("url")?.value==""){
          this.diningImg.patchValue({
            url:this.updateObject.url
          })
        }
        for (const key in data) {
          if(this.updateObject.id==data[key].id){
            this.dataServ.create(this.diningImg.value,"diningImages",key);
            break;
          }
        }
      })
    }
    this.uploadingImg="null";
  }

  // --------------------------------------- update part ---------------------------------------
  update(item:any,sectionViewController:string){
    this.updateObject=item;
    if(this.edit_control=='dining-carsouel' && sectionViewController=='edit')
      {
        this.sectionViewController=sectionViewController
      } else if(this.edit_control=='dining-products' && sectionViewController=='edit')
      {
        this.diningImg.patchValue({
          url:this.updateObject.url
        })
        this.sectionViewController=sectionViewController
      }
  }

  // --------------------------------------- delete part ---------------------------------------
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
    //----------- delete carasoul -----------
    if(this.edit_control=='dining-carsouel' && sectionViewController=='delete')
    {
      this.sectionViewController=sectionViewController;
      this.dataServ.getDiningCarsoul().subscribe(data=>{
        for (const key in data) {
          if(item.id==data[key].id){
            this.dataServ.delete("diningCarasoul",key);
            break;
          }
        }
      })
      // ----------- delete content -----------
    } else if(this.edit_control=='dining-products' && sectionViewController=='delete')
    {
      this.sectionViewController=sectionViewController;
      this.dataServ.getDiningImages().subscribe(data=>{
        for (const key in data) {
          if(item.id==data[key].id){
            this.dataServ.delete("diningImages",key);
            break;
          }
        }
      })
    }
  }


  // --------------------------------------------  upload photos -----------------------------------------

  // funcion to upload img file and get image url   ---- for dining carasoul -------
  async uploadCarasoul(event:any,edit_control:string){
    this.edit_control=edit_control
    this.uploadingCarasoul="uploadingCarasoul";
    const file=event.target.files[0];
    if(file){
      const path=`alBairaq/${file.name}${new Date().getTime()}`; // we make name of file in firebase storage 
      const uploadTask = await this.firestorage.upload(path,file)
      const url =await uploadTask.ref.getDownloadURL()
      this.CarasoulURL=url;
    }
    this.uploadingCarasoul="CarasoulUploaded";
  }
  // funcion to upload img file and get image url ---- for product -------
  async uploadImg(event:any,edit_control:string){
    this.edit_control=edit_control
    this.uploadingImg="uploadingImg";
    const file=event.target.files[0];
    if(file){
      const path=`alBairaq/${file.name}${new Date().getTime()}`; // we make name of file in firebase storage 
      const uploadTask = await this.firestorage.upload(path,file)
      const url =await uploadTask.ref.getDownloadURL()
      this.productURL=url;
    }
    this.uploadingImg="imgUploaded";
  }

}

