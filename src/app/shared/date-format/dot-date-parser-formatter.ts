import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class DotDateParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!match) {
      return null;
    }

    return {
      day: Number(match[1]),
      month: Number(match[2]),
      year: Number(match[3]),
    };
  }

  format(date: NgbDateStruct | null): string {
    if (!date) {
      return '';
    }

    return [
      String(date.day).padStart(2, '0'),
      String(date.month).padStart(2, '0'),
      String(date.year).padStart(4, '0'),
    ].join('.');
  }
}
