<template>
    <el-container>
        <el-main style="display: flex;padding: 0px;">
            <el-menu
                router
                :default-active="activeIndex"
                default-openeds="['setting-base-mib','setting-base-entity']"
                :collapse="isCollapse"
                background-color="#252d47"
                text-color="#ffffff"
                active-text-color="#3081ef">
                <el-menu-item index="/notify">
                    <i class="el-icon-phone-outline"></i> 
                    <span slot="title">通知管理</span>
                </el-menu-item>
                <el-menu-item index="/system">
                    <i class="el-icon-setting"></i> 
                    <span slot="title">用户管理</span>
                </el-menu-item>
                <div style="position:absolute;top:45%;left:100%;">
                    <i :class="isCollapse?'el-icon-d-arrow-right':'el-icon-d-arrow-left'" style="width:16px;color:#252d47;font-weight:500;cursor:pointer;" @click="onToggleView"></i>
                </div>
            </el-menu>
            <el-container style="height:calc(100vh - 50px);"  class="clear">
                <el-main style="margin:10px 10px 30px 10px;padding:0px;overflow:hidden;">
                    <router-view />
                </el-main>
            </el-container>
        </el-main>
    </el-container>
    
</template>

<script>

export default {
    data(){
        return {
            isCollapse: false,
            menu: false,
            activeIndex: '/notify'
        }
    },
    methods:{
        onToggleView(){
            this.isCollapse = !this.isCollapse;
        }
    }
}
</script>

<style scoped>
    
    .el-menu{
        height: 100vh;
        width: 200px;
    }

    .el-menu--collapse.el-menu {
        width: 64px;
    }

    .el-menu /deep/ .active{
        color:rgb(48, 135, 250);
    }

    .el-menu-item.is-active i {
        color:rgb(48, 135, 250);
    }

    .el-menu--collapse>.el-menu-item.is-active i {
        color:rgb(48, 135, 250);
    }

    .el-menu a{
        text-decoration: none;
        color: #ffffff;
    }

    .clear{
        clear:both;
    }
</style>
