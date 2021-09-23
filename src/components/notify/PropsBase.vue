<template>
    <div v-if="model" class="box">
        <el-select v-model="model.field" placeholder="属性" style="width:30%;">
            <el-option :label="att.label" :value="att.value" :key="att.name" v-for="att in attrs"></el-option>
        </el-select>
        <el-select v-model="model.operator" placeholder="比较器" style="margin-left: 1px;width:15%;">
            <el-option :label="operator.value" :value="operator.value" :key="index" v-for="(operator,index) in operators"></el-option>
        </el-select>
        
        <el-select v-model="model.value" placeholder="值" style="margin-left: 1px;width:55%;" v-if="model.ftype==='string'">
            <el-option :label="operator.value" :value="operator.value" :key="index" v-for="(operator,index) in operators"></el-option>
        </el-select>
         <el-select v-model="model.value" placeholder="值" style="margin-left: 1px;width:55%;" v-else-if="model.ftype==='boolean'">
            <el-option label="" value=""></el-option>
            <el-option label="是" value="true"></el-option>
            <el-option label="否" value="false"></el-option>
        </el-select>
        <el-input placeholder="值" v-model="model.value" style="margin-left: 1px;width:55%;" v-else></el-input>

         <el-button type="success" icon="el-icon-minus" @click="onRemove(model)" style="margin-left: 10px;"></el-button>
         <el-button type="danger" icon="el-icon-plug" @click="onNew">+</el-button>
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
                operators: [{
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
        },
        methods: {
            onNew(){
                this.$emit("new-prop");
            },
            onRemove(data){
                this.$emit("remove-prop",data);
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