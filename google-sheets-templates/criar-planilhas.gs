/**
 * BR Academy - Script para Criar Planilhas do Google Sheets
 *
 * COMO USAR:
 * 1. Acesse https://script.google.com
 * 2. Clique em "New Project"
 * 3. Apague o codigo padrao e cole TODO este codigo
 * 4. Clique em "Run" (botao de play)
 * 5. Na primeira vez, vai pedir permissao - clique "Allow"
 * 6. Aguarde ~10 segundos - as 3 planilhas serao criadas
 * 7. Os IDs das planilhas aparecerão no log (View > Logs)
 *
 * O script cria:
 * - BR Academy - Leads (3 abas)
 * - BR Academy - Matriculas (2 abas)
 * - BR Academy - Financeiro (3 abas)
 */

function criarPlanilhasBRAcademy() {
  var resultados = {};

  // ========================================
  // 1. PLANILHA DE LEADS
  // ========================================
  var leadsSheet = SpreadsheetApp.create('BR Academy - Leads');
  resultados['GOOGLE_SHEET_LEADS_ID'] = leadsSheet.getId();

  // Aba: leads (principal - ja existe como Sheet1)
  var abaLeads = leadsSheet.getSheets()[0];
  abaLeads.setName('leads');
  abaLeads.appendRow([
    'lead_id', 'name', 'email', 'phone', 'source',
    'nationality', 'visa_type', 'english_level', 'preferred_date',
    'stage', 'score', 'priority', 'qualification_notes',
    'created_at', 'updated_at', 'next_follow_up', 'notes',
    'utm_source', 'utm_campaign', 'lost_reason', 'referred_by'
  ]);
  formatarCabecalho(abaLeads);
  abaLeads.setFrozenRows(1);
  abaLeads.setColumnWidth(1, 180);  // lead_id
  abaLeads.setColumnWidth(2, 150);  // name
  abaLeads.setColumnWidth(3, 200);  // email
  abaLeads.setColumnWidth(4, 150);  // phone
  abaLeads.setColumnWidth(10, 120); // stage
  abaLeads.setColumnWidth(13, 250); // qualification_notes
  abaLeads.setColumnWidth(17, 250); // notes

  // Aba: conversation_history
  var abaConversas = leadsSheet.insertSheet('conversation_history');
  abaConversas.appendRow([
    'lead_id', 'role', 'message', 'channel', 'timestamp'
  ]);
  formatarCabecalho(abaConversas);
  abaConversas.setFrozenRows(1);
  abaConversas.setColumnWidth(3, 400); // message

  // Aba: stage_history
  var abaStageHistory = leadsSheet.insertSheet('stage_history');
  abaStageHistory.appendRow([
    'lead_id', 'from_stage', 'to_stage', 'changed_by', 'timestamp', 'notes'
  ]);
  formatarCabecalho(abaStageHistory);
  abaStageHistory.setFrozenRows(1);

  Logger.log('✅ Leads Sheet criada: https://docs.google.com/spreadsheets/d/' + leadsSheet.getId());

  // ========================================
  // 2. PLANILHA DE MATRICULAS
  // ========================================
  var enrollmentSheet = SpreadsheetApp.create('BR Academy - Matriculas');
  resultados['GOOGLE_SHEET_ENROLLMENT_ID'] = enrollmentSheet.getId();

  // Aba: enrollments (principal)
  var abaEnrollments = enrollmentSheet.getSheets()[0];
  abaEnrollments.setName('enrollments');
  abaEnrollments.appendRow([
    'enrollment_id', 'lead_id', 'name', 'email', 'phone',
    'course_date', 'course_type', 'amount_paid', 'currency',
    'payment_method', 'payment_id', 'payment_status',
    'enrolled_at', 'status', 'certificate_sent', 'documents_sent',
    'feedback_score', 'feedback_text', 'attendance'
  ]);
  formatarCabecalho(abaEnrollments);
  abaEnrollments.setFrozenRows(1);
  abaEnrollments.setColumnWidth(1, 200);  // enrollment_id
  abaEnrollments.setColumnWidth(2, 180);  // lead_id
  abaEnrollments.setColumnWidth(3, 150);  // name
  abaEnrollments.setColumnWidth(4, 200);  // email
  abaEnrollments.setColumnWidth(18, 300); // feedback_text

  // Aba: courses
  var abaCourses = enrollmentSheet.insertSheet('courses');
  abaCourses.appendRow([
    'course_id', 'date', 'type', 'max_students', 'enrolled_count',
    'spots_available', 'instructor', 'location', 'status', 'notes'
  ]);
  formatarCabecalho(abaCourses);
  abaCourses.setFrozenRows(1);
  abaCourses.setColumnWidth(7, 150);  // instructor
  abaCourses.setColumnWidth(8, 200);  // location
  abaCourses.setColumnWidth(10, 250); // notes

  // Adicionar primeiro curso como exemplo
  abaCourses.appendRow([
    'CRS-20260301', '2026-03-01', 'weekend', 15, 0,
    15, 'Leo', 'Dublin City Centre', 'scheduled', 'Proximo curso disponivel'
  ]);

  Logger.log('✅ Matriculas Sheet criada: https://docs.google.com/spreadsheets/d/' + enrollmentSheet.getId());

  // ========================================
  // 3. PLANILHA FINANCEIRA
  // ========================================
  var financialSheet = SpreadsheetApp.create('BR Academy - Financeiro');
  resultados['GOOGLE_SHEET_FINANCIAL_ID'] = financialSheet.getId();

  // Aba: transactions (principal)
  var abaTransactions = financialSheet.getSheets()[0];
  abaTransactions.setName('transactions');
  abaTransactions.appendRow([
    'date', 'type', 'category', 'description', 'amount',
    'currency', 'payment_method', 'payment_id',
    'enrollment_id', 'lead_id', 'status'
  ]);
  formatarCabecalho(abaTransactions);
  abaTransactions.setFrozenRows(1);
  abaTransactions.setColumnWidth(4, 250); // description

  // Aba: reports
  var abaReports = financialSheet.insertSheet('reports');
  abaReports.appendRow([
    'report_date', 'report_month', 'today_income', 'monthly_income',
    'monthly_expenses', 'monthly_profit', 'monthly_enrollments',
    'total_leads', 'new_leads_today', 'enrolled_total',
    'lost_total', 'conversion_rate'
  ]);
  formatarCabecalho(abaReports);
  abaReports.setFrozenRows(1);

  // Aba: expenses_recurring
  var abaDespesas = financialSheet.insertSheet('expenses_recurring');
  abaDespesas.appendRow([
    'description', 'amount', 'currency', 'frequency',
    'category', 'auto_record', 'next_date'
  ]);
  formatarCabecalho(abaDespesas);
  abaDespesas.setFrozenRows(1);
  abaDespesas.setColumnWidth(1, 250); // description

  // Adicionar despesas fixas comuns como exemplo
  abaDespesas.appendRow(['Aluguel espaco curso', 0, 'EUR', 'monthly', 'rent', false, '']);
  abaDespesas.appendRow(['n8n hosting (Hostinger VPS)', 0, 'EUR', 'monthly', 'other', true, '']);
  abaDespesas.appendRow(['Z-API WhatsApp', 0, 'BRL', 'monthly', 'other', true, '']);
  abaDespesas.appendRow(['OpenAI API', 0, 'USD', 'monthly', 'other', true, '']);
  abaDespesas.appendRow(['Supabase (Postgres)', 0, 'USD', 'monthly', 'other', true, '']);
  abaDespesas.appendRow(['Upstash (Redis)', 0, 'USD', 'monthly', 'other', true, '']);

  Logger.log('✅ Financeiro Sheet criada: https://docs.google.com/spreadsheets/d/' + financialSheet.getId());

  // ========================================
  // RESUMO FINAL
  // ========================================
  Logger.log('');
  Logger.log('========================================');
  Logger.log('🎉 TODAS AS PLANILHAS FORAM CRIADAS!');
  Logger.log('========================================');
  Logger.log('');
  Logger.log('Configure estas variaveis de ambiente no n8n:');
  Logger.log('');
  Logger.log('GOOGLE_SHEET_LEADS_ID = ' + resultados['GOOGLE_SHEET_LEADS_ID']);
  Logger.log('GOOGLE_SHEET_ENROLLMENT_ID = ' + resultados['GOOGLE_SHEET_ENROLLMENT_ID']);
  Logger.log('GOOGLE_SHEET_FINANCIAL_ID = ' + resultados['GOOGLE_SHEET_FINANCIAL_ID']);
  Logger.log('');
  Logger.log('Links diretos:');
  Logger.log('Leads:      https://docs.google.com/spreadsheets/d/' + resultados['GOOGLE_SHEET_LEADS_ID']);
  Logger.log('Matriculas: https://docs.google.com/spreadsheets/d/' + resultados['GOOGLE_SHEET_ENROLLMENT_ID']);
  Logger.log('Financeiro: https://docs.google.com/spreadsheets/d/' + resultados['GOOGLE_SHEET_FINANCIAL_ID']);

  // Mostrar alerta com os IDs
  var ui = SpreadsheetApp.getUi ? SpreadsheetApp.getUi() : null;
  if (!ui) {
    // Rodando via script.google.com, usar Logger
    Logger.log('');
    Logger.log('⚠️  IMPORTANTE: Va em View > Logs para ver os IDs');
  }

  return resultados;
}

/**
 * Formata a linha de cabecalho (negrito, fundo azul, texto branco)
 */
function formatarCabecalho(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1a73e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // Auto-resize colunas que nao tiveram largura manual definida
  for (var i = 1; i <= sheet.getLastColumn(); i++) {
    if (sheet.getColumnWidth(i) === 100) { // default width
      sheet.setColumnWidth(i, 130);
    }
  }
}
