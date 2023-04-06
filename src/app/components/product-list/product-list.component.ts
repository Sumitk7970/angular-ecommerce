import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})

export class ProductListComponent implements OnInit {

    products: Product[] = [];
    currentCategoryId: number = 1;
    previousCategoryId: number = 1;
    searchMode: boolean = false;

    // new properties for pagination
    pageNumber: number = 1;
    pageSize: number = 10;
    totalElements: number = 0;

    previousKeyword: string = "";

    constructor(private productService: ProductService, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(() => {
            this.listProducts();
        });
    }

    listProducts() {
        this.searchMode = this.route.snapshot.paramMap.has('keyword');
        if (this.searchMode) {
            this.handleSearchProducts();
        } else {
            this.handleListProducts();
        }
    }

    handleSearchProducts() {
        const keyword = this.route.snapshot.paramMap.get('keyword')!;

        // if we have different keyword than previous
        // then set the page number to 1
        if (this.previousKeyword != keyword) {
            this.pageNumber = 1;
        }
        this.previousKeyword = keyword;

        // now search for products using keyword
        this.productService.searchProductsPaginate(this.pageNumber-1, this.pageSize, keyword)
            .subscribe(this.processResult());
    }

    handleListProducts() {
        // check if id parameter is available
        const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

        if (hasCategoryId) {
            // get the id param string. Use + to convert it to number
            this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
        } else {
            this.currentCategoryId = 1;
        }

        // check if we have a different category id than previous 
        // Angular will reuse a component if it is currently being viewed

        // if we have different category id than previous 
        // then set page number back to 1
        if (this.previousCategoryId != this.currentCategoryId) {
            this.pageNumber = 1;
        }

        this.previousCategoryId = this.currentCategoryId;

        // now get the products
        this.productService.getProductListPaginate(
            this.pageNumber - 1,
            this.pageSize,
            this.currentCategoryId
        ).subscribe(this.processResult());
    }

    updatePageSize(thePageSize: string) {
        this.pageSize = +thePageSize;
        this.pageNumber = 1;
        this.listProducts();
    }
    
    processResult() {
        return (data: any) => {
            this.products = data._embedded.products;
            this.pageNumber = data.page.number + 1;
            this.pageSize = data.page.size;
            this.totalElements = data.page.totalElements;
        };
    }
}
