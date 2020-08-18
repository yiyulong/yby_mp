import { getRequest, postRequest } from './request'
module.exports.getProductCarousel = (data, config = {}) => getRequest('/b2b/product/productCarousel', data, config) // 获取首页轮播图列表
module.exports.getB2bOrderBatchInfo = (data, config = {}) => getRequest('/b2b/getB2bOrderBatchInfo', data, config) // 获取时装系列信息
module.exports.getB2bChoicenessAttributeInfo = (data, config = {}) => getRequest('/b2b/getB2bChoicenessAttributeInfo', data, config) // 获取精选品类信息
module.exports.getB2bChoicenessProductInfo = (data, config = {}) => getRequest('/b2b/getB2bChoicenessProductInfo', data, config) // 获取精选商品信息
module.exports.getB2bPdfProfileInfo = (data, config = {}) => getRequest('/b2b/getB2bPdfProfileInfo', data, config) // 获取PDF信息
module.exports.getB2bCategoryInfo = (data, config = {}) => getRequest('/b2b/getB2bCategoryInfo', data, config) // 获取类目信息
