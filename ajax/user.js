import { getRequest, postRequest } from './request'
module.exports.login = (data, config = {}) => postRequest('/b2b/login', data, config) // 用户登陆
module.exports.getMsgInfo = (data, config = {}) => getRequest('/b2b/user/getMsgInfo', data, config) // 获取订阅消息列表
