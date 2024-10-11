import request from '@/config/axios'

// 公寓信息 VO
export interface RoomVO {
  id: number // ID
  code: string // 房号
  type: number // 类型
  status: number // 状态
  remark: string // 备注
}

// 公寓信息 API
export const RoomApi = {
  // 查询公寓信息分页
  getRoomPage: async (params: any) => {
    return await request.get({ url: `/sr/room/page`, params })
  },

  // 查询公寓信息详情
  getRoom: async (id: number) => {
    return await request.get({ url: `/sr/room/get?id=` + id })
  },

  // 新增公寓信息
  createRoom: async (data: RoomVO) => {
    return await request.post({ url: `/sr/room/create`, data })
  },

  // 修改公寓信息
  updateRoom: async (data: RoomVO) => {
    return await request.put({ url: `/sr/room/update`, data })
  },

  // 删除公寓信息
  deleteRoom: async (id: number) => {
    return await request.delete({ url: `/sr/room/delete?id=` + id })
  },

  // 导出公寓信息 Excel
  exportRoom: async (params) => {
    return await request.download({ url: `/sr/room/export-excel`, params })
  },

  // 获取公寓精简信息列表
  getSimpleRoomList: async (): Promise<RoomVO[]> => {
    return await request.get({ url: `/sr/room/simple-list` })
  }
}
