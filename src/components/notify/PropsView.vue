<template>
    <div>
        <el-switch
            v-model="rtype"
            active-text="全部"
            inactive-text="任意"
            active-value="and"
            inactive-value="or">
        </el-switch>
        <props-base 
            :attrs="fields"
            :model="attr"  v-for="(attr,index) in attrs" :key="attr.name"
            @new-prop="onNewProp"
            @remove-prop="onRemoveProp"
            ref="props"></props-base>

        <el-button type="default" icon="el-icon-delete" @click="onRemoveAll">全部删除</el-button>
    </div>
</template>

<script>
import PropsBase from './PropsBase.vue'
    export default {
        components: { PropsBase },
        props: {
            fields: Array
        },
        data(){
            return {
                attrs: [{
                    id: new Date(),
                    field: '',
                    ftype: 'boolean',
                    operator:'',
                    value: ''
                }],
                rtype: "and"
            }
        },
        watch:{
            fields(val){
                this.onRemoveAll();
            },  
            attrs:{
                handler(val){
                    this.onRefreshProps(val);
                },
                deep:true
            },
            rtype(){
                this.onRefreshProps(this.attrs);
            }
        },
        mounted(){
            this.$on("refresh-props",()=>{
                this.onRefreshProps(this.attrs);
            })
        },
        methods: {
            onNewProp(){
                this.attrs.push({
                    id: new Date(),
                    field: '',
                    operator:'',
                    value: ''
                })
            },
            onRemoveProp(data){
                let index = this.attrs.indexOf(data);
                if(this.attrs.length === 1) {
                    this.onRemoveAll();
                    return false;
                }
                this.attrs.splice(index,1);
            },
            onRemoveAll(){
                this.attrs.splice(0);
                this.onNewProp();
                this.$refs.props[0].fieldSelected = "";
            },
            onRefreshProps(data){
                
                let mqlStr = _.compact(data.map(v=>{
                    if(v.value){
                        if(_.includes(['varchar'],v.ftype)){
                            return `${v.field} ${v.operator} '${v.value}'`;
                        } else{
                            return `${v.field} ${v.operator} ${v.value}`;
                        }
                    }
                }));
                this.$emit("update-props", mqlStr.join(` ${this.rtype} `));
            }
        }
        
    }
</script>

<style scoped>

</style>