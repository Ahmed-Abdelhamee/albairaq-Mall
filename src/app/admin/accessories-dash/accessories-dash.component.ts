import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Database } from '@angular/fire/database';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-accessories-dash',
  templateUrl: './accessories-dash.component.html',
  styleUrls: ['./accessories-dash.component.scss']
})
export class AccessoriesDashComponent implements OnInit {
  
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
  viewController:string="accessories";
  uploadingImg:string="null";
  uploadingCarasoul:string="null";
  // for check update
  updateObject:any;
  // for check delete
  deletedObject: any;
  // for popup deleted item show
  showDeleteDiv:boolean=false;
  // for adding 
  accessoriesImg=this.fb.group({
    img:[""],
    url:[""],
    id:[new Date().getTime()]
  })


  constructor(route:Router,private fb:FormBuilder , private database:Database, private dataServ:DataService , private firestorage:AngularFireStorage) { 
    if(sessionStorage.getItem("Admin")!="AdminisTrue"){
      route.navigate(["/admin/dash-login"])
    }
    this.databaseURL=this.database.app.options.databaseURL;
  }

  ngOnInit(): void {
    this.openPart('table data','accessories-carsouel','')
  }


// ------------------------------------- send data to add to database -----------------------------------
  
  // ------------- Carasoul function for accessories -----------------
  sendCarasoul(edit_control:string,sectionViewController:string){
    this.accessoriesImg.patchValue({
      img:this.CarasoulURL,
    })
    // add carasoul
    if(edit_control=="accessories-carsouel" && sectionViewController =="add")
    {
      this.dataServ.create(this.accessoriesImg.value,"accessoriesCarasoul","add");
    }
    // edit carasoul
    else if(edit_control=="accessories-carsouel" && sectionViewController =="edit"){
      this.dataServ.getaccessoriesCarasoul().subscribe(data=>{
        for (const key in data) {
          if(this.updateObject.id==data[key].id){
            this.accessoriesImg.patchValue({
              id:Number(this.updateObject.id)
            })
            this.dataServ.create(this.accessoriesImg.value,"accessoriesCarasoul",key);
            break;
          }
        }
      })
    }
    this.uploadingCarasoul="null";
    setTimeout(()=> location.reload(),700)
  }
  
  // ------------- product function for accessories -----------------
  sendProducts(edit_control:string,sectionViewController:string){
    this.accessoriesImg.patchValue({
      img:this.productURL
    })
    if(edit_control=="accessories-products" && sectionViewController =="add"){
      this.dataServ.create(this.accessoriesImg.value,"accessoriesImages","add");
    }
    else if(edit_control=="accessories-products" && sectionViewController =="edit"){
      this.dataServ.getaccessoriesImages().subscribe(data=>{
        this.accessoriesImg.patchValue({
          id:Number(this.updateObject.id)
        })
        // code for if there is no change for one of product elements
        if(this.accessoriesImg.get("img")?.value==""){
          this.accessoriesImg.patchValue({
            img:this.updateObject.img
          })
        }else if(this.accessoriesImg.get("url")?.value==""){
          this.accessoriesImg.patchValue({
            url:this.updateObject.url
          })
        }
        for (const key in data) {
          if(this.updateObject.id==data[key].id){
            this.dataServ.create(this.accessoriesImg.value,"accessoriesImages",key);
            break;
          }
        }
      })
    }
    this.uploadingImg="null";
    setTimeout(()=> location.reload(),700)
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
    this.accessoriesImg.patchValue({
      url:""
    })
  }

  // ------------------------------------ show data table -------------------------------------
  showdata(type:string){
    this.datalist=[]
    this.edit_control=type;
    if(type=="accessories-carsouel"){
      this.dataServ.getaccessoriesCarasoul().subscribe(data=>{
        for (const key in data) {
          this.datalist.push(data[key])
        }
      })
    }else  if(type=="accessories-products"){
      this.dataServ.getaccessoriesImages().subscribe(data=>{
        for (const key in data) {
          this.datalist.push(data[key])
        }
      })
    }
  }

  // --------------------------------------- update part ---------------------------------------
  update(item:any,sectionViewController:string){
    this.updateObject=item;
    if(this.edit_control=='accessories-carsouel' && sectionViewController=='edit')
      {
        this.sectionViewController=sectionViewController
      } else if(this.edit_control=='accessories-products' && sectionViewController=='edit')
      {
        this.accessoriesImg.patchValue({
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
    if(this.edit_control=='accessories-carsouel' && sectionViewController=='delete')
    {
      this.sectionViewController=sectionViewController;
      this.dataServ.getaccessoriesCarasoul().subscribe(data=>{
        for (const key in data) {
          if(item.id==data[key].id){
            this.dataServ.delete("accessoriesCarasoul",key);
            break;
          }
        }
      })
      // ----------- delete content -----------
    } else if(this.edit_control=='accessories-products' && sectionViewController=='delete')
    {
      this.sectionViewController=sectionViewController;
      this.dataServ.getaccessoriesImages().subscribe(data=>{
        for (const key in data) {
          if(item.id==data[key].id){
            this.dataServ.delete("accessoriesImages",key);
            break;
          }
        }
      })
    }
    setTimeout(() => { this.showdata(this.edit_control) }, 700);
  }


  // --------------------------------------------  upload photos -----------------------------------------

  // funcion to upload img file and get image url   ---- for accessories carasoul -------
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


