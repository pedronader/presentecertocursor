import { supabase } from '../lib/supabase';

export interface ProductCSVRow {
  name: string;
  description: string;
  price_brl: number;
  image_url?: string;
  affiliate_link: string;
  source: string;
  external_id?: string;
  category_id?: string;
  emotional_tags?: string; // Comma-separated values
  personality_match?: string; // Comma-separated values
  age_range?: string; // Comma-separated values
  relationship_types?: string; // Comma-separated values
  budget_range?: string;
  occasion_tags?: string; // Comma-separated values
  priority?: number;
  status?: string;
}

export interface ImportResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; error: string; data?: any }>;
  logId?: string;
}

export class CSVImporter {
  async importProductsFromCSV(csvData: ProductCSVRow[]): Promise<ImportResult> {
    try {
      // Create import log
      const { data: logData, error: logError } = await supabase
        .from('product_import_logs')
        .insert({
          source: 'csv_import',
          operation_type: 'csv_import',
          total_records: csvData.length,
          status: 'running'
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating import log:', logError);
      }

      const logId = logData?.id;

      // Transform CSV data to match database format
      const transformedData = csvData.map((row, index) => {
        try {
          return {
            name: row.name?.trim(),
            description: row.description?.trim(),
            price_brl: Number(row.price_brl),
            image_url: row.image_url?.trim() || null,
            affiliate_link: row.affiliate_link?.trim(),
            source: row.source?.trim() || 'manual',
            external_id: row.external_id?.trim() || null,
            category_id: row.category_id?.trim() || null,
            emotional_tags: row.emotional_tags ? 
              row.emotional_tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            personality_match: row.personality_match ? 
              row.personality_match.split(',').map(p => p.trim()).filter(Boolean) : [],
            age_range: row.age_range ? 
              row.age_range.split(',').map(age => age.trim()).filter(Boolean) : [],
            relationship_types: row.relationship_types ? 
              row.relationship_types.split(',').map(rel => rel.trim()).filter(Boolean) : [],
            budget_range: row.budget_range?.trim() || null,
            occasion_tags: row.occasion_tags ? 
              row.occasion_tags.split(',').map(occ => occ.trim()).filter(Boolean) : [],
            priority: row.priority ? Number(row.priority) : 0,
            status: row.status?.trim() || 'active'
          };
        } catch (error) {
          throw new Error(`Row ${index + 1}: ${error.message}`);
        }
      });

      // Validate required fields
      const errors: Array<{ row: number; error: string; data?: any }> = [];
      const validData: any[] = [];

      transformedData.forEach((item, index) => {
        const rowNumber = index + 1;
        
        if (!item.name) {
          errors.push({ row: rowNumber, error: 'Name is required' });
          return;
        }
        
        if (!item.affiliate_link) {
          errors.push({ row: rowNumber, error: 'Affiliate link is required' });
          return;
        }
        
        if (!item.price_brl || isNaN(item.price_brl)) {
          errors.push({ row: rowNumber, error: 'Valid price is required' });
          return;
        }

        validData.push(item);
      });

      let successCount = 0;
      let errorCount = errors.length;

      // Process valid data in batches
      if (validData.length > 0) {
        try {
          // Use the bulk upsert function
          const { data: bulkResult, error: bulkError } = await supabase
            .rpc('bulk_upsert_products', { products_data: validData });

          if (bulkError) {
            throw bulkError;
          }

          successCount = bulkResult.success_count || 0;
          errorCount += bulkResult.error_count || 0;

          // Add bulk operation errors to our errors array
          if (bulkResult.errors && Array.isArray(bulkResult.errors)) {
            bulkResult.errors.forEach((error: any) => {
              errors.push({
                row: 0, // Bulk operation, can't determine exact row
                error: `${error.product}: ${error.error}`,
                data: error
              });
            });
          }

        } catch (error) {
          console.error('Bulk upsert error:', error);
          errorCount += validData.length;
          errors.push({
            row: 0,
            error: `Bulk operation failed: ${error.message}`,
            data: error
          });
        }
      }

      // Update import log
      if (logId) {
        await supabase
          .from('product_import_logs')
          .update({
            successful_records: successCount,
            failed_records: errorCount,
            error_details: { errors },
            completed_at: new Date().toISOString(),
            status: errorCount === 0 ? 'completed' : 'completed'
          })
          .eq('id', logId);
      }

      return {
        success: errorCount === 0,
        successCount,
        errorCount,
        errors,
        logId
      };

    } catch (error) {
      console.error('CSV import error:', error);
      return {
        success: false,
        successCount: 0,
        errorCount: csvData.length,
        errors: [{ row: 0, error: error.message }]
      };
    }
  }

  parseCSVText(csvText: string): ProductCSVRow[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: ProductCSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: any = {};

      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          row[header] = values[index];
        }
      });

      data.push(row as ProductCSVRow);
    }

    return data;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  generateCSVTemplate(): string {
    const headers = [
      'name',
      'description', 
      'price_brl',
      'image_url',
      'affiliate_link',
      'source',
      'external_id',
      'category_id',
      'emotional_tags',
      'personality_match',
      'age_range',
      'relationship_types',
      'budget_range',
      'occasion_tags',
      'priority',
      'status'
    ];

    const sampleRow = [
      'Kit de Café Premium',
      'Kit completo com café especial e acessórios',
      '129.90',
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
      'https://amazon.com.br/kit-cafe-premium',
      'amazon',
      'B123456789',
      '',
      'conforto,sofisticação,prazer',
      'Calma e reflexiva,Prática e organizada',
      '26-35 anos,36-50 anos',
      'Marido/Esposa,Mãe/Pai',
      'R$ 51 - R$ 150',
      'Aniversário,Natal',
      '5',
      'active'
    ];

    return [headers.join(','), sampleRow.join(',')].join('\n');
  }
}