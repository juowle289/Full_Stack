import api from "./axios";

const IDENTITY_BASE =
  import.meta.env.VITE_API_IDENTITY || import.meta.env.VITE_API_BASE_URL;
const identityUrl = (path) => `${IDENTITY_BASE}${path}`;

export const reportApi = {
  dashboard() {
    return api.get(identityUrl("/api/identity/reports/dashboard"));
  },

  // Biểu đồ mượn/trả theo tháng trong năm. Path đúng theo tài liệu backend:
  // số ít "report" (không phải "reports") + camelCase "borrowReturn".
  borrowReturn(year) {
    return api.get(identityUrl("/api/identity/report/borrowReturn"), {
      params: { year },
    });
  },

  // Thống kê thể loại sách được mượn nhiều nhất trong năm.
  categoryStats(year) {
    return api.get(identityUrl("/api/identity/report/categoryStats"), {
      params: { year },
    });
  },

  // Doanh thu tiền phạt theo tháng trong năm.
  fineRevenue(year) {
    return api.get(identityUrl("/api/identity/report/fineRevenue"), {
      params: { year },
    });
  },
};
