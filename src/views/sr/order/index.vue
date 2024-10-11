<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="电话" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入电话"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select
          v-model="queryParams.sex"
          placeholder="请选择性别"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SR_SEX)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="房型" prop="roomType">
        <el-select
          v-model="queryParams.roomType"
          placeholder="请选择房型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SR_ROOM_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="入住日期" prop="planDate">
        <el-date-picker
          v-model="queryParams.planDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="预订日期" prop="reservationDate">
        <el-date-picker
          v-model="queryParams.reservationDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SR_ORDER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['sr:order:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['sr:order:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="电话" align="center" prop="mobile" />
      <el-table-column label="性别" align="center" prop="sex">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SR_SEX" :value="scope.row.sex" />
        </template>
      </el-table-column>
      <el-table-column label="房型" align="center" prop="roomType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SR_ROOM_TYPE" :value="scope.row.roomType" />
        </template>
      </el-table-column>
      <el-table-column label="入住日期" align="center" prop="planDate" :formatter="dateFormatter2" />
      <!-- <el-table-column label="预订日期" align="center" prop="reservationDate" :formatter="dateFormatter2" /> -->
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SR_ORDER_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" width="200px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handlePreview(scope.row.id)"
            v-hasPermi="['sr:order:update']"
            v-if="scope.row.status === 0"
          >
            打印
          </el-button>
          <el-button
            link
            type="primary"
            @click="openCustomerForm('checkin', 0, scope.row.id)"
            v-hasPermi="['sr:order:check-in']"
            v-if="scope.row.status === 0"
          >
            入住
          </el-button>
          <el-button
            link
            type="success"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['sr:order:update']"
            v-if="scope.row.status === 0"
          >
            编辑
          </el-button>
          <el-button
            link
            type="warning"
            @click="handleCancel(scope.row.id)"
            v-hasPermi="['sr:order:cancel']"
            v-if="scope.row.status === 0"
          >
            取消
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['sr:order:delete']"
            v-if="scope.row.status === 2"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 订单表单弹窗：添加/修改 -->
  <OrderForm ref="formRef" @success="getList" />
  <!-- 客户表单弹窗：添加/修改 -->
  <CustomerForm ref="customerFormRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { OrderApi, OrderVO } from '@/api/sr/order'
import OrderForm from './OrderForm.vue'
import CustomerForm from '../customer/CustomerForm.vue'
import { getAccessToken } from '@/utils/auth'

/** SR 订单 列表 */
defineOptions({ name: 'SrOrder' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OrderVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  mobile: undefined,
  sex: undefined,
  deposit: undefined,
  planDate: [],
  roomType: undefined,
  status: 0,
  reservationDate: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OrderApi.getOrderPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}
/** 订单转入 */
const customerFormRef = ref()
const openCustomerForm = (type: string, id?: number, oid?: number) => {
  customerFormRef.value.open(type, id, oid)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await OrderApi.deleteOrder(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 取消按钮操作 */
const handleCancel = async (id: number) => {
  try {
    // 取消的二次确认
    await message.confirm(t("sr.order.cancelOrder"))
    // 发起取消
    await OrderApi.cancelOrder(id)
    message.success(t('common.cancelSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

const handlePreview = async (id: number) => {
  try {
    const previewUrl = import.meta.env.VITE_BASE_URL + '/jmreport/view/966192782775967744?id=' + id + '&token=' + getAccessToken()
    // 新标签页打开订单预览
    window.open(previewUrl, '_blank')
    
  } catch {}
}


/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await OrderApi.exportOrder(queryParams)
    download.excel(data, 'SR 订单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
