import request from '@/config/axios'

// 客户 VO
export interface CustomerVO {
  [x: string]: any
  id: number // ID
  name: string // 姓名
  mobile: string // 电话
  idno: string // 身份证号
  sex: number // 性别
  contractStart: Date // 合同开始
  contractEnd: Date // 合同结束
  contractDate: Date // 合同日期
  roomId: number // 房号
  fingerprint: string // 指纹编号
  contactName: string // 紧急联系人
  contactMobile: string // 联系人电话
  status: number // 状态
  remark: string // 备注
  orderId: number // 订单ID
}

// 客户 API
export const CustomerApi = {
  // 查询客户分页
  getCustomerPage: async (params: any) => {
    return await request.get({ url: `/sr/customer/page`, params })
  },

  // 查询客户详情
  getCustomer: async (id: number) => {
    return await request.get({ url: `/sr/customer/get?id=` + id })
  },

  // 新增客户
  createCustomer: async (data: CustomerVO) => {
    return await request.post({ url: `/sr/customer/create`, data })
  },

  // 修改客户
  updateCustomer: async (data: CustomerVO) => {
    return await request.put({ url: `/sr/customer/update`, data })
  },

  // 删除客户
  deleteCustomer: async (id: number) => {
    return await request.delete({ url: `/sr/customer/delete?id=` + id })
  },

  // 导出客户 Excel
  exportCustomer: async (params) => {
    return await request.download({ url: `/sr/customer/export-excel`, params })
  },

  // 入住
  checkin: async (data: CustomerVO) => {
    return await request.post({ url: `/sr/customer/check-in`, data })
  },

  // 退租
  checkout: async (data: CustomerVO) => {
    return await request.put({ url: `/sr/customer/checkout`, data })
  },

  // 续租
  renew: async (data: CustomerVO) => {
    return await request.put({ url: `/sr/customer/renew`, data })
  }
}
