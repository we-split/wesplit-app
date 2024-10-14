import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseRoutingModule } from './purchase-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule as MatInputModule } from '@angular/material/input';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import { BaseElementsModule } from '../base-elements/base-elements.module';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { MatSelectModule as MatSelectModule } from '@angular/material/select';
import { MatOptionModule as MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule as MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule as MatDialogModule } from '@angular/material/dialog';
import { TranslocoModule } from '@ngneat/transloco';
import { MatFormFieldModule as MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [PurchaseFormComponent],
  imports: [
    CommonModule,
    PurchaseRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BaseElementsModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatDialogModule,
    TranslocoModule,
  ],
})
export class PurchaseModule {}
