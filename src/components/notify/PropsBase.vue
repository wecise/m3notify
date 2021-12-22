<template>
    <div v-if="model" class="box">
        <el-select v-model="model.field" filterable value-key="name" placeholder="属性" style="width:30%;">
            <el-option label="" value="" />
            <el-option :label="att.name" :value="att.name" :key="att.name" v-for="att in attrs">
                <span style="float: left">{{ att.title || att.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ att.ftype }}</span>
            </el-option>
        </el-select>
        <el-select v-model="model.operator" placeholder="比较器" style="margin-left: 1px;width:15%;">
            <el-option :label="operator.value" :value="operator.value" :key="index" v-for="(operator,index) in operatorsSelected">
                <span style="float: left">{{ operator.value }}</span>
            </el-option>
        </el-select>
        <el-input placeholder="值" v-model="model.value" style="margin-left: 1px;width:55%;"></el-input>
         <el-button type="danger" icon="el-icon-minus" @click="onRemove(model)" style="margin-left: 10px;"></el-button>
         <el-button type="success" icon="el-icon-plug" @click="onNew">+</el-button>
    </div>
</template>

<script>
    export default {
        props:{
            attrs: Array,
            model: Object
        },
        data(){
            return {
                fieldSelected: "",
                operatorsSelected: [],
                operators: 
                {
                    boolean:[{
                        type: 'boolean',
                        value: ''
                    },
                    {
                        type: 'boolean',
                        value: 'true'
                    },
                    {
                        type: 'boolean',
                        value: 'false'
                    }],
                    varchar:[{
                        type: 'string',
                        value: ''
                    },
                    {
                        type: 'string',
                        value: '='
                    },
                    {
                        type: 'string',
                        value: '!='
                    },
                    {
                        type: 'string',
                        value: 'like'
                    },
                    {
                        type: 'string',
                        value: 'in'
                    }],
                    smallint: [{
                        type: 'string',
                        value: ''
                    },
                    {
                        type: 'string',
                        value: '>'
                    },
                    {
                        type: 'string',
                        value: '<'
                    },
                    {
                        type: 'string',
                        value: '='
                    },
                    {
                        type: 'string',
                        value: '>='
                    },
                    {
                        type: 'string',
                        value: '<='
                    },
                    {
                        type: 'string',
                        value: '<>'
                    }],
                    int: [{
                        type: 'string',
                        value: ''
                    },
                    {
                        type: 'string',
                        value: '>'
                    },
                    {
                        type: 'string',
                        value: '<'
                    },
                    {
                        type: 'string',
                        value: '='
                    },
                    {
                        type: 'string',
                        value: '>='
                    },
                    {
                        type: 'string',
                        value: '<='
                    },
                    {
                        type: 'string',
                        value: '<>'
                    }],
                    timestamp: [{
                        type: 'string',
                        value: ''
                    },
                    {
                        type: 'string',
                        value: '>'
                    },
                    {
                        type: 'string',
                        value: '<'
                    },
                    {
                        type: 'string',
                        value: '='
                    },
                    {
                        type: 'string',
                        value: '>='
                    },
                    {
                        type: 'string',
                        value: '<='
                    },
                    {
                        type: 'string',
                        value: '!='
                    }]
                }
            }
        },
        watch:{
            'model.field'(val){
                try{
                    let field = _.find(this.attrs,{name:val});
                    this.model.field = val;
                    this.model.ftype = field.ftype;
                    this.operatorsSelected = this.operators[field.ftype];
                }catch(err){
                    this.operatorsSelected = this.operators['varchar'];
                }
            }
        },
        created(){
            this.$nextTick(()=>{
                if(this.model){
                    this.fieldSelected = this.model.field;
                }
            })
        },
        methods: {
            onNew(){
                this.$emit("new-prop");
            },
            onRemove(data){
                this.$emit("remove-prop",data);
                this.fieldSelected = "";
            }
        }
        
    }
</script>

<style scoped>
    .box{
        display: flex;
        margin: 5px;
    }
</style>
<style>
    .box .el-input--small .el-input__inner {
        border-radius: 0;
        border: 1px solid #f2f2f2;
    }
</style>