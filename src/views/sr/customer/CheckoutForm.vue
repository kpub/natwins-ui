<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-row>
      <el-col :span="8">
        <CustomerCard :cid="refId" />
      </el-col>
      <el-col :span="8">
        <EventListCard />
      </el-col>
      <el-col :span="8">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          v-loading="formLoading"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="事项名称" prop="title" :required="true">
                <el-input v-model="formData.title" placeholder="请输入事项名称" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="操作类型" prop="operation" :required="true">
                <el-select v-model="formData.operation" placeholder="请选择操作类型" :disabled="true">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SR_OPERATION_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="财务类型" prop="financeType" :required="true">
                <el-radio-group v-model="formData.financeType" :disabled="true">
                  <el-radio-button
                    v-for="dict in getIntDictOptions(DICT_TYPE.SR_FINANCE_TYPE)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="财务标签" prop="financeTag" :required="true">
                <el-select v-model="formData.financeTag" placeholder="请选择财务标签" :disabled="true">
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SR_FINANCE_TAG)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="退租日期" prop="contractDate" :required="true">
                <el-date-picker
                  v-model="formData.eventDate"
                  type="date"
                  value-format="x"
                  placeholder="选择退租日期"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="退费金额" prop="amount" :required="true">
                <el-input
                  v-model="formData.amount"
                  placeholder="退费金额"
                  clearable
                  style="width: 220px"
                >
                  <template #prepend>￥</template>
                  <template #append>元</template>
                </el-input>
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
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CustomerApi, CustomerVO } from '@/api/sr/customer'
import { EventApi, EventVO } from '@/api/sr/event'
import { RoomApi, RoomVO } from '@/api/sr/room'
import CustomerCard from './components/CustomerCard.vue'
import EventListCard from '../event/components/EventListCard.vue'

/** Checkout 表单 */
defineOptions({ name: 'CheckoutForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：renew - 续租

/** 表单数据 */
const formData = ref({
  title: '',
  eventDate: new Date(),
  operation: 0,
  financeType: -1,
  financeTag: 50,
  amount: 0,
  remark: '',
  refType: 'customer',
  refId: 0
})
const formRules = reactive({
  title: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  eventDate: [{ required: true, message: '退租日期不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '退费金额不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const roomList = ref([] as RoomVO[]) // 房间列表
const customer = ref({} as CustomerVO) // 客户信息
const refId = ref(0) // 客户 ID

/** 打开弹窗 */
const open = async (type: string, id: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  refId.value = id

  // 加载 Room 列表
  roomList.value = await RoomApi.getSimpleRoomList()

  // 重置表单
  resetForm()
  // 设置客户数据
  formLoading.value = true
  try {
    customer.value = await CustomerApi.getCustomer(id)
    formData.value = {
      ...formData.value,
      title: '[' + customer.value.name + '] 退租',
      operation: 15,
      amount: customer.value.monthRent,
      refId: id
    }
    console.log('formData:', formData.value)
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
    let data = formData.value as unknown as EventVO
    data = {
      ...data,
      refId: refId.value
    }

    await EventApi.checkout(data)
    message.success(t('sr.message.renewSuccess'))

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
    title: '',
    eventDate: new Date(),
    operation: 0,
    financeType: -1,
    financeTag: 50,
    amount: 0,
    remark: '',
    refType: 'customer',
    refId: 0
  }
  formRef.value?.resetFields()
}
</script>
