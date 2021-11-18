<template>
    <el-cascader
        v-model="value"
        :options="options"
        :props="props"
        collapse-tags
        clearable></el-cascader>
</template>

<script>
import _ from 'lodash';

export default {
    name:'DataFieldsView',
    props: {
        fields: Array
    },
    data(){
        return {
            value: [],
            options: [],
            props: { 
                multiple: true,
                emitPath: false,
                checkStrictly: true
            }
        }
    },
    watch: {
        fields: {
            handler(val){
                this.options = _.map(val, v=>{
                    return {value: v.name, label:v.name, type: v.ftype};
                })
            },
            immediate: true
        },
        value: {
            handler(val){
                this.$emit("fields-change",val);
            }
        }
    }
}
</script>
<style scoped>

</style>