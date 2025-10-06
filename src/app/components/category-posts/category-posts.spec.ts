import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryPosts } from './category-posts';

describe('CategoryPosts', () => {
  let component: CategoryPosts;
  let fixture: ComponentFixture<CategoryPosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryPosts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryPosts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
