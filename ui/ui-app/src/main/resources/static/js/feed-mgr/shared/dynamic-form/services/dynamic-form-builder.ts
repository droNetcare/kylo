import {FormGroup} from "@angular/forms";
import {FieldConfigBuilder} from "./field-config-builder";
import {FieldConfig} from "../model/FieldConfig";
import {FormFieldBuilder} from "./form-field-builder";
import {DynamicFormFieldGroupBuilder} from "./dynamic-form-field-group-builder";
import {FieldGroup, Layout} from "../model/FieldGroup"


export class FormConfig{

    title:string;
    message: string;
    fieldGroups:FieldGroup[];

    onApplyFn:Function;
    onCancelFn:Function;

    form:FormGroup;

    constructor(){

    }
}
export interface StyleClassStrategy{

    applyStyleClass(builder:FieldConfigBuilder<any>):void;
}

export class HintLengthPaddingStrategy implements StyleClassStrategy{

    constructor(private hintLength1:number  = 120, private hintLength2: number = 160, private hintLength3:number = 200){}

    applyStyleClass(builder:FieldConfigBuilder<any>):void{
        if(builder.getHint() ){
            if(builder.getHint().length > this.hintLength3){
                builder.appendStyleClass("pad-bottom-lg");
            } else if(builder.getHint().length > this.hintLength2){
                builder.appendStyleClass("pad-bottom-md");
            } else if(builder.getHint().length > this.hintLength1){
                builder.appendStyleClass("pad-bottom");
            }
        }
    }
}

export class DynamicFormBuilder {

    private title:string;
    private message: string;
    private formFieldBuilders:DynamicFormFieldGroupBuilder[];
    private form:FormGroup

    private onApplyFn:Function;
    private onCancelFn:Function;

    public styleClassStrategy:StyleClassStrategy = new HintLengthPaddingStrategy();

    constructor(){
        this.formFieldBuilders = [];
    }

    setTitle(title:string){
        this.title = title;
        return this;
    }
    setMessage(value:string){
        this.message = value;
        return this;
    }

    setStyleClassStrategy(styleClassStrategy:StyleClassStrategy){
        this.styleClassStrategy = styleClassStrategy;
        return this;
    }

    onApply(callback:Function, bindTo?:any){
        if(bindTo) {
            this.onApplyFn = callback.bind(bindTo);
        }
        else {
            this.onApplyFn = callback;
        }
        return this;
    }

    onCancel(callback:Function,bindTo?:any){
        if(bindTo) {
            this.onCancelFn = callback.bind(bindTo);
        }
        else {
            this.onCancelFn = callback
        }
        return this;
    }

    row(){
        let rowBuilder = new DynamicFormFieldGroupBuilder(this,Layout.ROW);
        this.formFieldBuilders.push(rowBuilder);
        return rowBuilder;
    }

    column(){
        let columnBuilder = new DynamicFormFieldGroupBuilder(this,Layout.COLUMN);
        this.formFieldBuilders.push(columnBuilder);
        return columnBuilder;
    }

    done(){
        return this;
    }

    resetForm(){
        if(this.form) {
            console.log('RESET FORM!!!!')
            Object.keys(this.form.controls).forEach(controlName => {
                if(this.form.contains(controlName)) {
                    this.form.removeControl(controlName)
                }
            });
        }
        this.formFieldBuilders = [];



    }

    setForm(value:FormGroup){
        this.form = value;
        return this;
    }

    buildFieldConfiguration():FieldGroup[]{
        //set the fields
        let fieldGroups: FieldGroup[] = this.formFieldBuilders.map(builder => builder.build())
        return fieldGroups;
    }



    build():FormConfig{
        let formConfig = new FormConfig();

        formConfig.title = this.title;
        formConfig.message = this.message;

        //set the form
        if(this.form == undefined){
            this.form = new FormGroup({});
        }
        formConfig.form = this.form;

        //set the fields
        let fieldGroups: FieldGroup[] = this.buildFieldConfiguration();
        formConfig.fieldGroups = fieldGroups;

        //set the callbacks
        formConfig.onApplyFn = this.onApplyFn;
        formConfig.onCancelFn = this.onCancelFn;

        return formConfig;
    }
}
