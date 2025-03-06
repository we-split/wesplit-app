import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../shared/data.service';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Feedback } from '../../../models/Feedback';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';
import { LayoutComponent } from '../../base-elements/layouts/layout/layout.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'feedback',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
  standalone: true,
  imports: [
    TranslocoDirective,
    LayoutComponent,
    MatIconButton,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
  ],
})
export class FeedbackFormComponent implements OnInit {
  feedbackForm!: UntypedFormGroup;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private dataService: DataService,
    private formBuilder: UntypedFormBuilder,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.feedbackForm = this.formBuilder.group({
      message: ['', Validators.required],
      email: ['', Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')],
    });
  }

  async onSubmit() {
    if (this.feedbackForm.valid) {
      const form = this.feedbackForm.value as Feedback;
      this.loading$.next(true);

      await this.dataService.addFeedback(form).then(() => {
        this.feedbackForm.reset();
        this.loading$.next(false);
        this.location.back();
      });
    }
  }

  onBack() {
    this.location.back();
  }
}
