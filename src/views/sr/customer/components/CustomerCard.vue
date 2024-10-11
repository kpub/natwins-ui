<template>
  <el-card shadow="always" body-style="background-color: beige;">
    <el-form>
      <el-row>
        <el-col :span="colSpan">
          <el-form-item label="姓名:" prop="name">
            <el-text class="label">{{ dtl.name }}</el-text>
            <el-text class="label" style="margin-left: 15px">{{
              dtl.sex === 0 ? '[女]' : '[男]'
            }}</el-text>
          </el-form-item>
          <el-form-item label="电话:" prop="mobile">
            <el-text class="label">{{ dtl.mobile }}</el-text>
          </el-form-item>
          <el-form-item label="合同周期:" prop="contractStart">
            <el-text class="label">
              {{ formatDate(new Date(dtl.contractStart), 'YYYY/M/D') }} ~
              {{ formatDate(new Date(dtl.contractEnd), 'M/D') }}
            </el-text>
          </el-form-item>
          <el-form-item label="合同日期:" prop="contractEnd">
            <el-text class="label">{{
              formatDate(new Date(dtl.contractDate), 'YYYY/MM/DD')
            }}</el-text>
          </el-form-item>
          <el-form-item label="押金/月租:" prop="deposit">
            <el-text class="label">{{ dtl.deposit }} / {{ dtl.monthRent }} (元)</el-text>
          </el-form-item>
          <el-form-item label="已付：">
            <el-text class="label">{{ dtl.totalRent }} (元)</el-text>
          </el-form-item>
          <el-form-item label="备注:" prop="remark">
            <el-text class="label">{{ dtl.remark }}</el-text>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'
import { CustomerVO, CustomerApi } from '@/api/sr/customer'

defineOptions({ name: 'CustomerCard' })

const props = withDefaults(
  defineProps<{
    cid: number
    colSpan?: number
  }>(),
  {
    cid: 0,
    colSpan: 24
  }
)

const dtl = ref<CustomerVO>({} as CustomerVO)
// 通过 cid 获取客户信息
const getCustomerInfo = async () => {
  const res = await CustomerApi.getCustomer(props.cid)
  dtl.value = res
  console.log('dtl:', dtl.value)
}

onMounted(() => {
  getCustomerInfo()
})
</script>
