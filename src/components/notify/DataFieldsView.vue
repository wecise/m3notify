<template>
    <el-cascader
        v-model="value"
        :options="options"
        :props="props"
        collapse-tags
        clearable>
        <template slot-scope="{ node, data }">
            <span> {{ data.title}} </span>
            <span style="float:right;font-size:10px;color:#999999;"> {{ data.ftype}} </span>
        </template>    
    </el-cascader>
</template>

<script>
import _ from 'lodash';

export default {
    name:'DataFieldsView',
    props: {
        fields: Array,
        selected: Array
    },
    data(){
        return {
            value: [],
            options: [],
            props: { 
                value: 'name',
                label: 'title',
                multiple: true,
                emitPath: false,
                checkStrictly: true
            }
        }
    },
    watch: {
        fields: {
            handler(val){
                this.options = _.sortBy(val,['title','name'],['asc','asc']);
            },
            immediate: true
        },
        value: {
            handler(val){
                this.$emit("fields-change",val);
            }
        }
    },
    created(){
        if(this.selected){
            this.value = this.selected;
        }
    }
}
</script>
<style scoped>

</style>