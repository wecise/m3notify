<template>
    <div>
        <el-switch
            v-model="rtype"
            active-text="全部"
            inactive-text="任意"
            active-value="and"
            inactive-value="or">
        </el-switch>
        
        <props-base :model="attr"  v-for="(attr,index) in attrs" :key="index"
            @new-prop="onNewProp"
            @remove-prop="onRemoveProp"></props-base>

        <el-button type="default" icon="el-icon-delete" @click="onRemoveAll">全部删除</el-button>
    </div>
</template>

<script>
import PropsBase from './PropsBase.vue'
    export default {
        components: { PropsBase },
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
                if(this.attrs.length === 1) return false;
                this.attrs.splice(index,1);
            },
            onRemoveAll(){
                this.attrs = [];
                this.onNewProp();
            }
        }
        
    }
</script>

<style scoped>

</style>