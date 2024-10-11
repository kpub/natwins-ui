<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-row>
      <el-col :span="8">
        <CustomerInfo :info="customerInfo" />
      </el-col>
      <el-col :span="16">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          v-loading="formLoading"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="续租周期" prop="contractPeriod">
                <el-date-picker
                  v-model="formData.contractPeriod"
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
            <el-col :span="24">
              <el-form-item label="续租日期" prop="contractDate">
                <el-date-picker
                  v-model="formData.contractDate"
                  type="date"
                  value-format="x"
                  placeholder="选择续租日期"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="续租费用" prop="totalRent">
                <el-input
                  v-model="formData.totalRent"
                  placeholder="缴付金额"
                  clearable
                  style="width: 220px"
                >
                  <template #prepend>￥</template>
                  <template #append>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="续租押金" prop="deposit">
                <el-input
                  v-model="formData.deposit"
                  placeholder="续租押金"
                  clearable
                  style="width: 220px"
                >
                  <template #prepend>￥</template>
                  <template #append>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
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
            <el-col :span="24">
              <el-form-item label="紧急联系人" prop="contactName">
                <el-input v-model="formData.contactName" placeholder="请输入紧急联系人" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="联系人电话" prop="contactMobile">
                <el-input v-model="formData.contactMobile" placeholder="请输入联系人电话" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row> </el-form
      ></el-col>
    </el-row>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import { dateFormatter2 } from '@/utils/formatTime'
import { CustomerApi, CustomerVO } from '@/api/sr/customer'
import { RoomApi, RoomVO } from '@/api/sr/room'
import CustomerInfo from '@/views/sr/customer/components/CustomerInfo.vue'
import { InfoVO } from '@/views/sr/customer/components/CustomerInfo.vue'

/** Renew 表单 */
defineOptions({ name: 'RenewForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：renew - 续租


/** 表单数据 */
const formData = ref({
  id: Number,
  name: undefined,
  mobile: undefined,
  idno: undefined,
  sex: undefined,
  contractPeriod: [new Date(), new Date()],
  contractStart: new Date(),
  contractEnd: new Date(),
  contractDate: new Date(),
  roomId: undefined,
  fingerprint: undefined,
  contactName: undefined,
  contactMobile: undefined,
  status: 1,
  remark: undefined,
  deposit: 200,
  monthRent: 0,
  totalRent: 0,
  orderId: undefined
})
const formRules = reactive({
  totalRent: [{ required: true, message: '续租费用不能为空', trigger: 'blur' }],
  deposit: [{ required: true, message: '续租押金不能为空', trigger: 'blur' }],
  contractPeriod: [{ required: true, message: '续租周期不能为空', trigger: 'blur' }],
  contractDate: [{ required: true, message: '续租日期不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const roomList = ref([] as RoomVO[]) // 房间列表
let customerInfo = ref({} as InfoVO) // 客户信息

// 定义常用周期
const shortcuts = [
  {
    text: '1个月',
    value: () => {
      const start = dayjs(formData.value.contractEnd).add(1, 'day').toDate()
      const end = dayjs(start).add(1, 'month').add(-1, 'day').toDate()
      return [start, end]
    }
  },
  {
    text: '3个月',
    value: () => {
      const start = dayjs(formData.value.contractEnd).add(1, 'day').toDate()
      const end = dayjs(start).add(3, 'month').add(-1, 'day').toDate()
      return [start, end]
    }
  },
  {
    text: '年底',
    value: () => {
      const start = dayjs(formData.value.contractEnd).add(1, 'day').toDate()
      const end = dayjs().get('year') + '-12-31'
      return [start, end]
    }
  }
]


let startTime: Date = new Date()
let endTime: Date = dayjs(startTime).add(1, 'month').add(-1, 'day').toDate()

/** 打开弹窗 */
const open = async (type: string, id: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type

  // 加载 Room 列表
  roomList.value = await RoomApi.getSimpleRoomList()

  // 重置表单
  resetForm()
  // 设置客户数据
  formLoading.value = true
  try {
    formData.value = await CustomerApi.getCustomer(id)

    // 解构 formData 赋值给 customerInfo，用于显示客户信息
    customerInfo.value = {
      id: formData.value.id,
      name: formData.value.name,
      mobile: formData.value.mobile,
      idno: formData.value.idno,
      sex: formData.value.sex,
      contractStart: formData.value.contractStart,
      contractEnd: formData.value.contractEnd,
      contractDate: formData.value.contractDate,
      roomCode: formData.value.roomId,
      contactName: formData.value.contactName,
      contactMobile: formData.value.contactMobile,
      status: formData.value.status,
      remark: formData.value.remark,
      deposit: formData.value.deposit,
      monthRent: formData.value.monthRent,
      totalRent: formData.value.totalRent
    } as unknown as InfoVO

    startTime = dayjs(formData.value.contractEnd).add(1, 'day').toDate()
    endTime = dayjs(startTime).add(1, 'month').add(-1, 'day').toDate()
    formData.value.contractPeriod = [startTime, endTime] // 续租周期从上一次结束的第二天开始
    formData.value.deposit = 0 // 续租押金默认0
    formData.value.totalRent = formData.value.monthRent // 续租默认一个月
  } finally {
    formLoading.value = false
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
    formData.value.contractStart = formData.value.contractPeriod[0]
    formData.value.contractEnd = formData.value.contractPeriod[1]
    const data = formData.value as unknown as CustomerVO

    if (formType.value === 'renew') {
      await CustomerApi.renew(data)
      message.success(t('sr.message.renewSuccess'))
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
    id: Number,
    name: undefined,
    mobile: undefined,
    idno: undefined,
    sex: undefined,
    contractPeriod: [new Date(), new Date()],
    contractStart: new Date(),
    contractEnd: new Date(),
    contractDate: new Date(),
    roomId: undefined,
    fingerprint: undefined,
    contactName: undefined,
    contactMobile: undefined,
    status: 1,
    remark: undefined,
    deposit: 200,
    monthRent: 0,
    totalRent: 0,
    orderId: undefined
  }
  formRef.value?.resetFields()
}
</script>
