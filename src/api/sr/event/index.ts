import request from '@/config/axios'

// 事项 VO
export interface EventVO {
  title: string // 事项名称
  eventDate: Date // 事项时间
  financeType: number // 财务类型
  financeTag: number // 财务标签
  amount: number // 金额
  remark: string // 备注
  operation: number // 操作类型
  id: number // ID PK
  refType: string // 关联类型
  refId: number // 关联编号
}

// 事项 API
export const EventApi = {
  // 查询事项分页
  getEventPage: async (params: any) => {
    return await request.get({ url: `/sr/event/page`, params })
  },

  // 查询事项详情
  getEvent: async (id: number) => {
    return await request.get({ url: `/sr/event/get?id=` + id })
  },

  // 新增事项
  createEvent: async (data: EventVO) => {
    return await request.post({ url: `/sr/event/create`, data })
  },

  // 修改事项
  updateEvent: async (data: EventVO) => {
    return await request.put({ url: `/sr/event/update`, data })
  },

  // 删除事项
  deleteEvent: async (id: number) => {
    return await request.delete({ url: `/sr/event/delete?id=` + id })
  },

  // 导出事项 Excel
  exportEvent: async (params) => {
    return await request.download({ url: `/sr/event/export-excel`, params })
  },

  // 退租
  checkout: async (data: EventVO) => {
    return await request.post({ url: `/sr/event/checkout`, data })
  }
}
