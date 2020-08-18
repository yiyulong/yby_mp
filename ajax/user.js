import { getRequest, postRequest } from './request'
module.exports.login = (data, config = {}) => postRequest('/b2b/login', data, config) // 用户登陆