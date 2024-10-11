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
      <el-form-item label="合同日期" prop="contractDate">
        <el-date-picker
          v-model="queryParams.contractDate"
          :formatter="dateFormatter2"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="房号" prop="roomId">
        <el-input
          v-model="queryParams.roomId"
          placeholder="请输入房号"
          clearable
          @keyup.enter="handleQuery"
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
            v-for="dict in getIntDictOptions(DICT_TYPE.SR_CUSTOMER_STATUS)"
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
          v-hasPermi="['sr:customer:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['sr:customer:export']"
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
      <el-table-column
        label="合同开始"
        align="center"
        prop="contractStart"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column
        label="合同结束"
        align="center"
        prop="contractEnd"
        :formatter="dateFormatter2"
        width="180px"
      />
      <!-- <el-table-column
        label="合同日期"
        align="center"
        prop="contractDate"
        :formatter="dateFormatter2"
        width="180px"
      /> -->
      <el-table-column label="房号" align="center" prop="roomCode" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SR_CUSTOMER_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handlePreview(scope.row.id)"
            v-hasPermi="['sr:order:update']"
            v-if="scope.row.status === 1"
          >
            打印
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['sr:customer:update']"
          >
            修改
          </el-button>
          <el-button
            link
            type="primary"
            @click="openRenewForm('renew', scope.row.id)"
            v-hasPermi="['sr:customer:renew']"
          >
            续租
          </el-button>
          <el-button
            link
            type="info"
            @click="openCheckoutForm('checkout', scope.row.id)"
            v-hasPermi="['sr:customer:checkout']"
          >
            退租
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['sr:customer:delete']"
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

  <!-- 表单弹窗：添加/修改 -->
  <CustomerForm ref="formRef" @success="getList" />
  <!-- 续租 -->
  <RenewForm ref="renewFormRef" @success="getList" />
  <!-- 退租 -->
  <CheckoutForm ref="checkoutFormRef" @sucess="getList" />
  </template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { CustomerApi, CustomerVO } from '@/api/sr/customer'
import CustomerForm from './CustomerForm.vue'
import RenewForm from './RenewForm.vue'
import CheckoutForm from '@/views/sr/customer/CheckoutForm.vue'
import { getAccessToken } from '@/utils/auth'

/** 客户 列表 */
defineOptions({ name: 'SrCustomer' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<CustomerVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  mobile: undefined,
  sex: undefined,
  contractDate: [],
  roomId: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CustomerApi.getCustomerPage(queryParams)
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

/** 续租 */
const renewFormRef = ref()
const openRenewForm = (type: string, id?: number) => {
  renewFormRef.value.open(type, id)
}

/** 退租 */
const checkoutFormRef = ref()
const openCheckoutForm = (type: string, id: number) => {
  checkoutFormRef.value.open(type, id)
}

/** 日期格式化 */

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CustomerApi.deleteCustomer(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

const handlePreview = async (id: number) => {
  try {
    const previewUrl = import.meta.env.VITE_BASE_URL + '/jmreport/view/966244137645400064?id=' + id + '&token=' + getAccessToken()
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
    const data = await CustomerApi.exportCustomer(queryParams)
    download.excel(data, '客户.xls')
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
