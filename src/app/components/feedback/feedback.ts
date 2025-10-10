import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Wordpress } from '../../services/wordpress';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.html'
})
export class Feedback {
  feedbackMessage = '';
  successResponse = '';

  constructor(private wordpress: Wordpress) {}

  onSubmit(): void {
    this.wordpress.sendFeedback(this.feedbackMessage).subscribe(response => {
      console.log('Full API Response:', response);
      this.successResponse = response.confirmation;
    });
  }
}
