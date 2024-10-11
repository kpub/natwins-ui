/* stylelint-disable unicode-bom */
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入姓名" :disabled="isDisabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入电话" :disabled="isDisabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idno">
            <el-input v-model="formData.idno" placeholder="请输入身份证号" :disabled="isDisabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="formData.sex" :disabled="isDisabled">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SR_SEX)"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="押金" prop="deposit">
            <el-input v-model="formData.deposit" placeholder="请输入押金" :disabled="isDisabled">
              <template #prepend>￥</template>
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="月租金" prop="monthRent">
            <el-input v-model="formData.monthRent" placeholder="月租金" clearable>
              <template #prepend>￥</template>
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="总租金" prop="totalRent">
            <el-input v-model="formData.totalRent" placeholder="总租金" clearable>
              <template #prepend>￥</template>
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="房号" prop="roomId">
            <el-select v-model="formData.roomId" placeholder="请选择房号">
              <el-option
                v-for="item in roomList"
                :key="item.id"
                :label="'[' + item.type + '] ' + item.code"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同周期" prop="contractPeriod">
            <el-date-picker
              v-model="contractPeriod"
              type="daterange"
              unlink-panels
              range-separator="-"
              value-format="x"
              :formatter="dateFormatter2"
              start-placeholder="合同开始"
              end-placeholder="合同结束"
              :shortcuts="shortcuts"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同日期" prop="contractDate">
            <el-date-picker
              v-model="formData.contractDate"
              type="date"
              value-format="x"
              placeholder="选择合同日期"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="指纹编号" prop="fingerprint">
            <el-input v-model="formData.fingerprint" placeholder="请输入指纹编号" />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="紧急联系人" prop="contactName">
            <el-input v-model="formData.contactName" placeholder="请输入紧急联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人电话" prop="contactMobile">
            <el-input v-model="formData.contactMobile" placeholder="请输入联系人电话" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status" :disabled="isDisabled">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SR_CUSTOMER_STATUS)"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="附件" prop="attachments">
            <UploadImgs v-model="formData.attachments" :limit="9" height="120px" width="120px" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import { shortcuts } from '@/utils/dateUtil'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CustomerApi, CustomerVO } from '@/api/sr/customer'
import { OrderApi } from '@/api/sr/order'
import { RoomApi, RoomVO } from '@/api/sr/room'

/** 客户 表单 */
defineOptions({ name: 'CustomerForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const isDisabled = computed(() => formType.value === 'renew' || formType.value === 'checkout') // 是否只读

/** 表单数据 */
const formData = ref({
  id: undefined,
  name: undefined,
  mobile: undefined,
  idno: undefined,
  sex: undefined,
  contractStart: undefined,
  contractEnd: undefined,
  contractDate: Date.now(),
  roomId: undefined,
  fingerprint: undefined,
  contactName: undefined,
  contactMobile: undefined,
  status: 1,
  remark: undefined,
  deposit: 200,
  monthRent: 0,
  totalRent: 0,
  attachments: [],
  orderId: undefined
})
const contractPeriod = ref([undefined, undefined]) // 合同周期
const formRules = reactive({
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  mobile: [{ required: true, message: '电话不能为空', trigger: 'blur' }],
  idno: [{ required: true, message: '身份证号不能为空', trigger: 'blur' }],
  sex: [{ required: true, message: '性别不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const roomList = ref([] as RoomVO[]) // 房间列表

/** 打开弹窗 */
const open = async (type: string, id?: number, oid?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type

  // 加载 Room 列表
  roomList.value = await RoomApi.getSimpleRoomList()

  // 重置表单
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CustomerApi.getCustomer(id)
      contractPeriod.value = [formData.value.contractStart, formData.value.contractEnd]
    } finally {
      formLoading.value = false
    }
  }
  // 订单转入时，设置数据
  else if (oid) {
    formLoading.value = true
    try {
      formData.value = await OrderApi.getOrder(oid)
      formData.value.orderId = formData.value.id // 先将 orderId 赋值给 id
      formData.value.id = undefined // 再将 customer id 置空
      formData.value.status = 1
      formData.value.contractDate = Date.now()
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    formData.value.contractStart = contractPeriod.value[0]
    formData.value.contractEnd = contractPeriod.value[1]
    const data = formData.value as unknown as CustomerVO

    console.log('data:', formType.value, data)

    if (formType.value === 'create') {
      await CustomerApi.createCustomer(data)
      message.success(t('common.createSuccess'))
    } else if (formType.value === 'checkin') {
      await CustomerApi.checkin(data)
      message.success(t('sr.order.checkinSuccess'))
    } else {
      await CustomerApi.updateCustomer(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    mobile: undefined,
    idno: undefined,
    sex: undefined,
    contractStart: undefined,
    contractEnd: undefined,
    contractDate: Date.now(),
    roomId: undefined,
    fingerprint: undefined,
    contactName: undefined,
    contactMobile: undefined,
    status: 1,
    remark: undefined,
    deposit: 200,
    monthRent: 0,
    totalRent: 0,
    attachments: [],
    orderId: undefined
  }
  formRef.value?.resetFields()
}
</script>
