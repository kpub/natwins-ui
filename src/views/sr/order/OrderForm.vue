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
            <el-input v-model="formData.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="formData.sex">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SR_SEX)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="房型" prop="roomType">
            <el-radio-group v-model="formData.roomType">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SR_ROOM_TYPE)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入住日期" prop="planDate">
            <el-date-picker
              v-model="formData.planDate"
              type="date"
              value-format="x"
              placeholder="选择计划入住日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预订日期" prop="reservationDate">
            <el-date-picker
              v-model="formData.reservationDate"
              type="date"
              value-format="x"
              placeholder="选择预订日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订金" prop="deposit">
            <el-input v-model="formData.deposit" placeholder="请输入订金">
              <template #prepend>￥</template>
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status" read-only="true">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SR_ORDER_STATUS)"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" placeholder="请输入备注" />
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
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { OrderApi, OrderVO } from '@/api/sr/order'

/** SR 订单 表单 */
defineOptions({ name: 'OrderForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const fit = 'contain' // 图片的适应方式：contain - 适应
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  mobile: undefined,
  sex: 2,
  deposit: 0,
  planDate: Date.now() + 60 * 60 * 24 * 7 * 1000,
  roomType: 1,
  status: 0,
  remark: undefined,
  attachments: [],
  reservationDate: Date.now()
})
const formRules = reactive({
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  mobile: [{ required: true, message: '电话不能为空', trigger: 'blur' }],
  sex: [{ required: true, message: '性别不能为空', trigger: 'blur' }],
  deposit: [{ required: true, message: '订金不能为空', trigger: 'blur' }],
  planDate: [{ required: true, message: '计划入住日期不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  reservationDate: [{ required: true, message: '预订日期不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await OrderApi.getOrder(id)
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
    const data = formData.value as unknown as OrderVO
    if (formType.value === 'create') {
      await OrderApi.createOrder(data)
      message.success(t('common.createSuccess'))
    } else {
      await OrderApi.updateOrder(data)
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
    sex: 2,
    deposit: 200,
    planDate: Date.now() + 60 * 60 * 24 * 7 * 1000,
    roomType: 1,
    status: 0,
    remark: undefined,
    attachments: [],
    reservationDate: Date.now()
  }
  formRef.value?.resetFields()
}
</script>
