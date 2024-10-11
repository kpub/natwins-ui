<template>
  <el-form class="box">
    <el-row>
      <el-col :span="colSpan">
        <el-form-item label="姓名:" prop="name">
          <el-text class="label">{{ info.name }}</el-text>
          <el-text class="label" style="margin-left: 15px;">{{ info.sex === 0 ? '[女]': '[男]' }}</el-text>
        </el-form-item>
        <el-form-item label="电话:" prop="mobile">
          <el-text class="label">{{ info.mobile }}</el-text>
        </el-form-item>
        <el-form-item label="合同周期:" prop="contractStart">
          <el-text class="label">
            {{ formatDate(new Date(info.contractStart), 'YYYY/M/D') }} ~
            {{ formatDate(new Date(info.contractEnd), 'M/D') }}
          </el-text>
        </el-form-item>
        <el-form-item label="合同日期:" prop="contractEnd">
          <el-text class="label">{{ formatDate(new Date(info.contractDate), 'YYYY/MM/DD') }}</el-text>
        </el-form-item>
        <el-form-item label="押金/月租:" prop="deposit">
          <el-text class="label">{{ info.deposit }} / {{  info.monthRent }} (元)</el-text>
        </el-form-item>
        <el-form-item label="已付：">
          <el-text class="label">{{ info.totalRent }} (元)</el-text>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-text class="label">{{ info.remark }}</el-text>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'

export interface InfoVO {
  name: string,
  sex: number,
  mobile: string,
  contractStart: number,
  contractEnd: number,
  contractDate: number,
  deposit: number,
  monthRent: number,
  totalRent: number,
  remark: string,
}

defineOptions({ name: 'CustomerInfo' })

defineProps<{ info: InfoVO }>()
const colSpan = ref(24)

</script>
<style scoped lang="scss">
.box {
  background-color: beige;
  box-shadow: var(--el-box-shadow-light);

  .el-row {
    margin: 0 10px;
    padding: 0;
  }

  .label {
    // font-style: italic !important;
    font-size: 14px;
  }
}
</style>
