import Vue from "vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "notify",
    component: () => import("../components/notify/index.vue"),
  },
  {
    path: "/notify",
    name: "notify",
    meta: { title: "通知管理" },
    component: () => import("../components/notify/index.vue"),
  },
  {
    path: "/system",
    name: "system",
    meta: { title: "系统管理" },
    component: () => import("../components/system/index.vue"),
  },
];

const router = new VueRouter({
  routes,
  linkActiveClass: "active",
  linkExactActiveClass: "active",
});

export default router;
