<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-row>
      <el-col :span="8">
        <CustomerInfo :info="customerInfo" v-if="formData.refCustomer" />
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
              <el-form-item label="事项名称" prop="title">
                <el-input v-model="formData.title" placeholder="请输入事项名称" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="事项日期" prop="eventDate">
                <el-date-picker
                  v-model="formData.eventDate"
                  type="date"
                  value-format="x"
                  placeholder="选择事项日期"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="操作类型" prop="operation">
                <el-select v-model="formData.operation" placeholder="请选择操作类型">
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
              <el-form-item label="财务类型" prop="financeType">
                <el-radio-group v-model="formData.financeType">
                  <el-radio
                    v-for="dict in getIntDictOptions(DICT_TYPE.SR_FINANCE_TYPE)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="财务标签" prop="financeTag">
                <el-select v-model="formData.financeTag" placeholder="请选择财务标签">
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
              <el-form-item label="金额" prop="amount">
                <el-input v-model="formData.amount" placeholder="请输入金额" />
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-col>
    </el-row>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">{{
        dialogTitle
      }}</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CustomerApi } from '@/api/sr/customer'
import CustomerInfo from '@/views/sr/customer/components/CustomerInfo.vue'
import { InfoVO } from '@/views/sr/customer/components/CustomerInfo.vue'
import { EventVO, EventApi } from '@/api/sr/event';

/** 事项 表单 */
defineOptions({ name: 'EventAdd' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  title: '',
  eventDate: new Date(),
  financeType: -1,
  financeTag: 50,
  amount: 0,
  remark: '',
  operation: 15,
  id: 0,
  fromDate: new Date(),
  toDate: new Date(),
  refCustomer: false,
  refOrder: false,
  refRoom: false
})
const formRules = reactive({
  title: [{ required: true, message: '事项名称不能为空', trigger: 'blur' }],
  eventDate: [{ required: true, message: '事项日期不能为空', trigger: 'blur' }],
  operation: [{ required: true, message: '操作类型不能为空', trigger: 'blur' }],
  financeType: [{ required: true, message: '财务类型不能为空', trigger: 'blur' }],
  financeTag: [{ required: true, message: '财务标签不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '金额不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const instanceType = ref('') // 表单 Ref 对应的实体类型
const instanceId = ref(0) // 表单 Ref 对应的实体 ID
let customerInfo = ref({} as InfoVO) // 客户信息

/** 打开弹窗 */
const open = async (type: string, linkType: string, linkId: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  instanceId.value = linkId
  instanceType.value = linkType

  // 加载数据
  if (linkId) {
    switch (linkType) {
      case 'customer':
        customerInfo.value = await CustomerApi.getCustomer(linkId)
        formData.value.refCustomer = true
        formData.value.title = '[' + customerInfo.value.name + '] 退租'
        formData.value.eventDate = new Date()
        break
      default:
        break
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
    switch (formType.value) {
      case 'checkout':
        const eventDtl = {
          ...formData.value,
          refType: 'customer',
          refId: instanceId.value
        } as unknown as EventVO
        await EventApi.checkout(eventDtl)
        message.success(t('sr.message.checkoutSuccess'))
        break
      default:
        break
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
    title: '',
    eventDate: new Date(),
    financeType: -1,
    financeTag: 50,
    amount: 0,
    remark: '',
    operation: 15,
    id: 0,
    fromDate: new Date(),
    toDate: new Date(),
    refCustomer: false,
    refOrder: false,
    refRoom: false
  }
  formRef.value?.resetFields()
}
</script>
