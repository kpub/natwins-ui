import request from '@/config/axios'

// SR 订单 VO
export interface OrderVO {
  id: number // ID
  name: string // 姓名
  mobile: string // 电话
  sex: number // 性别
  deposit: number // 订金
  planDate: Date // 计划入住日期
  roomType: number // 房型
  status: number // 状态
  remark: string // 备注
  attachments: string // 附件
  reservationDate: Date // 预订日期
}

// SR 订单 API
export const OrderApi = {
  // 查询SR 订单分页
  getOrderPage: async (params: any) => {
    return await request.get({ url: `/sr/order/page`, params })
  },

  // 查询SR 订单详情
  getOrder: async (id: number) => {
    return await request.get({ url: `/sr/order/get?id=` + id })
  },

  // 新增SR 订单
  createOrder: async (data: OrderVO) => {
    return await request.post({ url: `/sr/order/create`, data })
  },

  // 修改SR 订单
  updateOrder: async (data: OrderVO) => {
    return await request.put({ url: `/sr/order/update`, data })
  },

  // 删除SR 订单
  deleteOrder: async (id: number) => {
    return await request.delete({ url: `/sr/order/delete?id=` + id })
  },

  // 取消 SR 订单
  cancelOrder: async (id: number) => {
    return await request.put({ url: `/sr/order/cancel?id=` + id })
  },
  
  // 导出SR 订单 Excel
  exportOrder: async (params) => {
    return await request.download({ url: `/sr/order/export-excel`, params })
  }
}
