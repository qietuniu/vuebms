import axios from 'axios'
import { Message } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 600000 // 请求超时时间
})
// request拦截器
service.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = 'application/json; charset=UTF-8'
    if (store.getters.token) {
      config.headers['accessToken'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非0是抛错
     */
    const res = response.data
    if (res.status.code !== 0) {
      if (res.status.message != '权限被禁止：执行预警' && res.status.message != '权限被禁止：请求令牌') {
        Message({
          message: res.status.message,
          type: 'error',
          duration: 2 * 1000
        })
      }
      return Promise.reject('error')
      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      //   MessageBox.confirm(
      //     '你已被登出，可以取消继续留在该页面，或者重新登录',
      //     '确定登出',
      //     {
      //       confirmButtonText: '重新登录',
      //       cancelButtonText: '取消',
      //       type: 'warning'
      //     }
      //   ).then(() => {
      //     store.dispatch('FedLogOut').then(() => {
      //       location.reload() // 为了重新实例化vue-router对象 避免bug
      //     })
      //   })
      // }
    } else {
      return response
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 2 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
